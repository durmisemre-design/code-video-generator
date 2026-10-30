import React from 'react';
import { Composition } from 'remotion';
import { ReelsVideo } from './ReelsVideo';
import videoData from './data/videoData.json';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="ReelsVideo"
                component={ReelsVideo}
                durationInFrames={videoData.durationInFrames} // 25.55 saniye x 60 FPS = 1533 frame
                fps={videoData.fps}
                width={1080}
                height={1920}
                defaultProps={{
                    captions: videoData.captions,
                    triggers: videoData.triggers as any,
                }}
            />
        </>
    );
};
