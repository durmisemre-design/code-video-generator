import React from 'react';
import { OffthreadVideo, staticFile } from 'remotion';

interface BackgroundVideoProps {
    src?: string;
    startFrom?: number;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
    src = staticFile('input-4k-60fps.mp4'),
    startFrom = 0,
}) => {
    return (
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Original Camera Fidelity: Zero Degradation, Zero Unwanted Color Tinting */}
            <OffthreadVideo
                src={src}
                startFrom={startFrom}
                pauseWhenBuffering={true}
                muted={true}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};
