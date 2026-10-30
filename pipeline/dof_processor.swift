import Foundation
import AVFoundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import CoreVideo
import AppKit

let ciContext = CIContext(options: [
    .workingColorSpace: CGColorSpace(name: CGColorSpace.extendedLinearSRGB)!,
    .outputColorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
    .useSoftwareRenderer: false
])

let personSegRequest: VNGeneratePersonSegmentationRequest = {
    let req = VNGeneratePersonSegmentationRequest()
    req.qualityLevel = .accurate
    req.outputPixelFormat = kCVPixelFormatType_OneComponent8
    return req
}()

enum OpticalDoFKernels {
    /// Builds a clean, artifact-free subject + handheld microphone matte:
    /// 1. Protects the handheld DJI Mic Mini 2 & furry windscreen in front of the mouth/chin/hand (`micInterior`)
    ///    so the microphone NEVER has any blur.
    /// 2. Eliminates the white ceiling lamp false-positive above the hair (`uv.y > 0.68` where pixels are bright/achromatic)
    ///    so the ceiling lamp NEVER flickers between sharp and blurred!
    static let buildSubjectAndMicMatte: CIColorKernel = {
        let src = """
        kernel vec4 subjectMic(__sample img, __sample rawM, __sample closedM, vec2 invSize) {
            vec2 uv = destCoord() * invSize;
            float base = rawM.r;

            // 1. Handheld microphone & fingers protection (strictly on the microphone/mouth/chin zone):
            vec2 dMic = (uv - vec2(0.56, 0.34)) / vec2(0.085, 0.15);
            float micInterior = 1.0 - smoothstep(0.65, 1.0, length(dMic));

            vec2 dTorso = (uv - vec2(0.53, 0.10)) / vec2(0.22, 0.13);
            float torsoInterior = 1.0 - smoothstep(0.68, 1.0, length(dTorso));

            vec2 dCore = (uv - vec2(0.555, 0.34)) / vec2(0.095, 0.165);
            float coreAllow = 1.0 - smoothstep(0.70, 1.0, length(dCore));
            float withHolesFilled = mix(base, max(base, closedM.r), coreAllow);

            float combined = max(withHolesFilled, max(micInterior, torsoInterior));

            // 2. White Ceiling Lamp Despiker:
            // Above uv.y = 0.68 (above forehead/eyebrows), the person ONLY has dark black hair (luma < 0.16)
            // or warm forehead skin (img.r > img.b + 0.08 and uv.y < 0.73).
            // The white ceiling lamp directly above his head is bright & neutral (luma > 0.20, r - b < 0.06).
            float luma = dot(img.rgb, vec3(0.2126, 0.7152, 0.0722));
            float warmth = img.r - img.b;
            float isUpperCrown = smoothstep(0.67, 0.73, uv.y);
            float isBrightNeutralLamp = smoothstep(0.16, 0.26, luma) * (1.0 - smoothstep(0.04, 0.11, warmth));
            float lampSuppress = 1.0 - (isUpperCrown * isBrightNeutralLamp);

            // Also hard ceiling limit above the top of hair (uv.y > 0.84)
            float topGuard = smoothstep(0.86, 0.80, uv.y);

            float outM = combined * lampSuppress * topGuard;
            return vec4(outM, outM, outM, 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    static let temporalEMA: CIColorKernel = {
        let src = """
        kernel vec4 ema(__sample cur, __sample prev, float alpha) {
            float v = mix(prev.r, cur.r, alpha);
            return vec4(v, v, v, 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    static let temporalRGBEMA: CIColorKernel = {
        let src = """
        kernel vec4 rgbEma(__sample cur, __sample prev, float alpha) {
            return vec4(mix(prev.rgb, cur.rgb, alpha), 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    /// Pure Normalized-Convolution Weighting:
    /// Multiplies background pixels by (1 - subjectMask)^3 so subject pixels contribute ZERO color to the blurred background,
    /// without ANY hard morphological dilation ring!
    static let premultiplyBgWeight: CIColorKernel = {
        let src = """
        kernel vec4 preBg(__sample img, __sample softSubj) {
            float bgW = clamp(1.0 - softSubj.r, 0.0, 1.0);
            // Smooth cubic falloff so subject interior and hair edge have ~0 weight in background blur
            float w = bgW * bgW * bgW;
            return vec4(img.rgb * w, 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    static let extractBgWeight: CIColorKernel = {
        let src = """
        kernel vec4 extBg(__sample softSubj) {
            float bgW = clamp(1.0 - softSubj.r, 0.0, 1.0);
            float w = bgW * bgW * bgW;
            return vec4(w, w, w, 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    static let divideNormalizedConv: CIColorKernel = {
        let src = """
        kernel vec4 divNC(__sample blurredRGB, __sample blurredW, __sample fallbackBlur) {
            float w = blurredW.r;
            vec3 normRGB = blurredRGB.rgb / max(w, 0.002);
            float valid = smoothstep(0.002, 0.04, w);
            return vec4(mix(fallbackBlur.rgb, normRGB, valid), 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()

    /// Multi-Band Seamless Optical Defocus Composite:
    /// Instead of pasting a sharp cutout over a heavily blurred background (which creates a visible contour line),
    /// blends smoothly through 3 progressive optical focus bands:
    /// Band 0 (m = 0.0..0.35): Far optical blur (14px)
    /// Band 1 (m = 0.20..0.75): Mid optical transition blur (5.5px)
    /// Band 2 (m = 0.55..0.92): Subtle optical rim softness (1.8px)
    /// Band 3 (m = 0.80..1.00): 100% razor-sharp subject & microphone (0px)
    static let multiBandOpticalComposite: CIColorKernel = {
        let src = """
        kernel vec4 multiComp(__sample sharpFg, __sample rimSoftFg, __sample midBlur, __sample farBlur, __sample smoothMatte) {
            float m = clamp(smoothMatte.r, 0.0, 1.0);

            // Progressive blend from farBlur -> midBlur -> rimSoftFg -> sharpFg
            float tMid = smoothstep(0.04, 0.55, m);
            vec3 layer1 = mix(farBlur.rgb, midBlur.rgb, tMid);

            float tRim = smoothstep(0.32, 0.82, m);
            vec3 layer2 = mix(layer1, rimSoftFg.rgb, tRim);

            float tSharp = smoothstep(0.62, 0.96, m);
            vec3 finalRGB = mix(layer2, sharpFg.rgb, tSharp);

            return vec4(finalRGB, 1.0);
        }
        """
        return CIColorKernel(source: src)!
    }()
}

func processFrame(
    srcImage: CIImage,
    extent: CGRect,
    bokehRadius: Double,
    prevMaskBuffer: CVPixelBuffer?,
    prevBgBuffer: CVPixelBuffer?
) -> (output: CIImage, currentMaskImage: CIImage, currentBgImage: CIImage) {
    let handler = VNImageRequestHandler(ciImage: srcImage, options: [:])
    try? handler.perform([personSegRequest])

    guard let maskBuffer = personSegRequest.results?.first?.pixelBuffer else {
        return (srcImage, srcImage, srcImage)
    }

    var rawMask = CIImage(cvPixelBuffer: maskBuffer)
    let sx = extent.width / rawMask.extent.width
    let sy = extent.height / rawMask.extent.height
    rawMask = rawMask.transformed(by: CGAffineTransform(scaleX: sx, y: sy)).cropped(to: extent)

    let scaleFactor = extent.width / 1920.0

    // Hole closing strictly for bridging the microphone-to-face interior
    let closedCoreMask = rawMask
        .clampedToExtent()
        .applyingFilter("CIMorphologyMaximum", parameters: [kCIInputRadiusKey: 10.0 * scaleFactor])
        .cropped(to: extent)
        .clampedToExtent()
        .applyingFilter("CIMorphologyMinimum", parameters: [kCIInputRadiusKey: 8.0 * scaleFactor])
        .cropped(to: extent)

    let invSize = CIVector(x: 1.0 / extent.width, y: 1.0 / extent.height)
    let protectedMask = OpticalDoFKernels.buildSubjectAndMicMatte.apply(
        extent: extent,
        arguments: [srcImage, rawMask, closedCoreMask, invSize]
    )!.cropped(to: extent)

    // Temporal EMA on subject matte (alpha = 0.32)
    let temporallyStableMask: CIImage
    if let prevBuf = prevMaskBuffer {
        let prevCI = CIImage(cvPixelBuffer: prevBuf).cropped(to: extent)
        temporallyStableMask = OpticalDoFKernels.temporalEMA.apply(
            extent: extent,
            arguments: [protectedMask, prevCI, 0.32]
        )!.cropped(to: extent)
    } else {
        temporallyStableMask = protectedMask
    }

    // Wide, smooth optical transition matte (9.5px Gaussian feather, NO hard morphological step!)
    // so focus rolls off gradually across hair tips, ears, and shoulders without any "cutout line"
    let smoothOpticalMatte = temporallyStableMask
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 8.5 * scaleFactor])
        .cropped(to: extent)

    // Direct 1-stage Normalized-Convolution Background Blur (ZERO morphological rings, ZERO CIBokehBlur disc lines!)
    let weightedBgRGB = OpticalDoFKernels.premultiplyBgWeight.apply(
        extent: extent,
        arguments: [srcImage, smoothOpticalMatte]
    )!.cropped(to: extent)
    let bgWeightOnly = OpticalDoFKernels.extractBgWeight.apply(
        extent: extent,
        arguments: [smoothOpticalMatte]
    )!.cropped(to: extent)

    let farSigma = bokehRadius * scaleFactor
    let midSigma = bokehRadius * 0.42 * scaleFactor

    let fallbackBlur = srcImage
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: farSigma * 1.3])
        .cropped(to: extent)

    let farBlurRGB = weightedBgRGB
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: farSigma])
        .cropped(to: extent)
    let farBlurW = bgWeightOnly
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: farSigma])
        .cropped(to: extent)
    let rawFarBlur = OpticalDoFKernels.divideNormalizedConv.apply(
        extent: extent,
        arguments: [farBlurRGB, farBlurW, fallbackBlur]
    )!.cropped(to: extent)

    // Temporal lock on the far background blur (alpha = 0.05) so the ceiling lamp and wall lights NEVER flicker
    let stableFarBlur: CIImage
    if let prevBg = prevBgBuffer {
        let prevBgCI = CIImage(cvPixelBuffer: prevBg).cropped(to: extent)
        stableFarBlur = OpticalDoFKernels.temporalRGBEMA.apply(
            extent: extent,
            arguments: [rawFarBlur, prevBgCI, 0.05]
        )!.cropped(to: extent)
    } else {
        stableFarBlur = rawFarBlur
    }

    let midBlurRGB = weightedBgRGB
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: midSigma])
        .cropped(to: extent)
    let midBlurW = bgWeightOnly
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: midSigma])
        .cropped(to: extent)
    let midBlur = OpticalDoFKernels.divideNormalizedConv.apply(
        extent: extent,
        arguments: [midBlurRGB, midBlurW, stableFarBlur]
    )!.cropped(to: extent)

    let rimSoftFg = srcImage
        .clampedToExtent()
        .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 2.0 * scaleFactor])
        .cropped(to: extent)

    // Multi-Band Seamless Optical Composite
    let finalComposite = OpticalDoFKernels.multiBandOpticalComposite.apply(
        extent: extent,
        arguments: [srcImage, rimSoftFg, midBlur, stableFarBlur, smoothOpticalMatte]
    )!.cropped(to: extent)

    return (finalComposite, temporallyStableMask, stableFarBlur)
}

func processVideo(inPath: String, outPath: String, outWidth: Int, outHeight: Int, bokehRadius: Double) {
    let asset = AVURLAsset(url: URL(fileURLWithPath: inPath))
    let semaphore = DispatchSemaphore(value: 0)
    var videoTrack: AVAssetTrack?
    asset.loadTracks(withMediaType: .video) { tracks, _ in
        videoTrack = tracks?.first
        semaphore.signal()
    }
    semaphore.wait()
    guard let track = videoTrack else {
        print("Error: no video track in \(inPath)")
        exit(1)
    }

    let reader = try! AVAssetReader(asset: asset)
    let readerSettings: [String: Any] = [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferMetalCompatibilityKey as String: true
    ]
    let readerOutput = AVAssetReaderTrackOutput(track: track, outputSettings: readerSettings)
    readerOutput.alwaysCopiesSampleData = false
    reader.add(readerOutput)

    let outURL = URL(fileURLWithPath: outPath)
    try? FileManager.default.removeItem(at: outURL)
    let writer = try! AVAssetWriter(outputURL: outURL, fileType: .mp4)
    let compressionProps: [String: Any] = [
        AVVideoAverageBitRateKey: 35_000_000,
        AVVideoMaxKeyFrameIntervalKey: 1,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
    let writerSettings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: outWidth,
        AVVideoHeightKey: outHeight,
        AVVideoCompressionPropertiesKey: compressionProps
    ]
    let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: writerSettings)
    writerInput.expectsMediaDataInRealTime = false
    let sourceBufferAttrs: [String: Any] = [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: outWidth,
        kCVPixelBufferHeightKey as String: outHeight,
        kCVPixelBufferMetalCompatibilityKey as String: true
    ]
    let adaptor = AVAssetWriterInputPixelBufferAdaptor(
        assetWriterInput: writerInput,
        sourcePixelBufferAttributes: sourceBufferAttrs
    )
    writer.add(writerInput)

    reader.startReading()
    writer.startWriting()
    writer.startSession(atSourceTime: .zero)

    let targetExtent = CGRect(x: 0, y: 0, width: CGFloat(outWidth), height: CGFloat(outHeight))
    var prevMaskBuf: CVPixelBuffer? = nil
    var prevBgBuf: CVPixelBuffer? = nil
    var frameCount = 0
    let tStart = Date()

    while reader.status == .reading {
        autoreleasepool {
            guard let sampleBuffer = readerOutput.copyNextSampleBuffer() else { return }
            let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
            guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

            var srcCI = CIImage(cvPixelBuffer: imageBuffer)
            if srcCI.extent.width != targetExtent.width || srcCI.extent.height != targetExtent.height {
                let sx = targetExtent.width / srcCI.extent.width
                let sy = targetExtent.height / srcCI.extent.height
                srcCI = srcCI.transformed(by: CGAffineTransform(scaleX: sx, y: sy)).cropped(to: targetExtent)
            }

            let (outCI, curMaskCI, curBgCI) = processFrame(
                srcImage: srcCI,
                extent: targetExtent,
                bokehRadius: bokehRadius,
                prevMaskBuffer: prevMaskBuf,
                prevBgBuffer: prevBgBuf
            )

            var nextMaskBuf: CVPixelBuffer? = nil
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &nextMaskBuf)
            if let mBuf = nextMaskBuf {
                ciContext.render(curMaskCI, to: mBuf, bounds: targetExtent, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
                prevMaskBuf = mBuf
            }

            var nextBgBuf: CVPixelBuffer? = nil
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &nextBgBuf)
            if let bBuf = nextBgBuf {
                ciContext.render(curBgCI, to: bBuf, bounds: targetExtent, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
                prevBgBuf = bBuf
            }

            while !writerInput.isReadyForMoreMediaData {
                Thread.sleep(forTimeInterval: 0.001)
            }

            var outPixelBuffer: CVPixelBuffer? = nil
            CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &outPixelBuffer)
            if let dstBuf = outPixelBuffer {
                ciContext.render(outCI, to: dstBuf, bounds: targetExtent, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
                adaptor.append(dstBuf, withPresentationTime: pts)
            }

            frameCount += 1
            if frameCount % 180 == 0 {
                let elapsed = Date().timeIntervalSince(tStart)
                print(String(format: "  processed %d frames (%.1f fps)", frameCount, Double(frameCount) / elapsed))
                fflush(stdout)
            }
        }
    }

    writerInput.markAsFinished()
    let finishSem = DispatchSemaphore(value: 0)
    writer.finishWriting {
        finishSem.signal()
    }
    finishSem.wait()
    let totalElapsed = Date().timeIntervalSince(tStart)
    print(String(format: "DONE %@ -> %d frames in %.1fs (%.1f fps)", outPath, frameCount, totalElapsed, Double(frameCount) / totalElapsed))
}

let args = CommandLine.arguments
guard args.count >= 5 else {
    print("Usage: dof_processor [preview|video] ...")
    exit(1)
}

let mode = args[1]
if mode == "preview" {
    let inPath = args[2]
    let timeSec = Double(args[3]) ?? 16.65
    let outPath = args[4]
    let radius = args.count > 5 ? (Double(args[5]) ?? 14.5) : 14.5

    let asset = AVURLAsset(url: URL(fileURLWithPath: inPath))
    let gen = AVAssetImageGenerator(asset: asset)
    gen.appliesPreferredTrackTransform = true
    gen.requestedTimeToleranceBefore = .zero
    gen.requestedTimeToleranceAfter = .zero
    let cmTime = CMTime(seconds: timeSec, preferredTimescale: 600)
    let cgImg = try! gen.copyCGImage(at: cmTime, actualTime: nil)
    let targetExtent = CGRect(x: 0, y: 0, width: 1920, height: 1080)
    var ciImg = CIImage(cgImage: cgImg)
    ciImg = ciImg.transformed(by: CGAffineTransform(scaleX: 1920.0 / ciImg.extent.width, y: 1080.0 / ciImg.extent.height)).cropped(to: targetExtent)
    let (outCI, _, _) = processFrame(srcImage: ciImg, extent: targetExtent, bokehRadius: radius, prevMaskBuffer: nil, prevBgBuffer: nil)
    let outCG = ciContext.createCGImage(outCI, from: targetExtent)!
    let rep = NSBitmapImageRep(cgImage: outCG)
    let png = rep.representation(using: .png, properties: [:])!
    try! png.write(to: URL(fileURLWithPath: outPath))
    print("Preview saved to", outPath)
} else if mode == "video" {
    let inPath = args[2]
    let outPath = args[3]
    let radius = Double(args[4]) ?? 14.5
    let w = args.count > 5 ? (Int(args[5]) ?? 1920) : 1920
    let h = args.count > 6 ? (Int(args[6]) ?? 1080) : 1080
    processVideo(inPath: inPath, outPath: outPath, outWidth: w, outHeight: h, bokehRadius: radius)
}
