import { Config } from '@remotion/cli/config';

// macOS Apple Silicon Chrome headless shell crash fix
Config.setBrowserExecutable('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
Config.setOverwriteOutput(true);

// Fix frame tearing and buffer drops (eliminates single-frame flashes/macroblocks/blackouts)
Config.setDisableSharedMemoryCapture(true);
Config.setDisallowParallelEncoding(true);
Config.setJpegQuality(100);

// Single concurrency guarantees deterministic frame decoding without FFmpeg pipe race conditions / buffer drops
Config.setConcurrency(1);
Config.setPublicDir('./public');
Config.setNumberOfSharedAudioTags(10);
Config.setOffthreadVideoCacheSizeInBytes(1024 * 1024 * 1024);
Config.setTimeoutInMilliseconds(120000);
Config.setDelayRenderTimeoutInMilliseconds(120000);
Config.setPublicLicenseKey('free-license');
