import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { TriggerItem } from '../../types/video';
import { SaasEcosystemScene } from './SaasEcosystemScene';
import { RedAlertScene } from './RedAlertScene';
import { FileBypassScene } from './FileBypassScene';
import { DdosOverloadScene } from './DdosOverloadScene';
import { AiAuditorScene } from './AiAuditorScene';
import { ShieldBarrierScene } from './ShieldBarrierScene';
import { KineticCtaScene } from './KineticCtaScene';

interface SceneManagerProps {
    triggers: TriggerItem[];
}

export const SceneManager: React.FC<SceneManagerProps> = ({ triggers }) => {
    const { fps } = useVideoConfig();

    return (
        <>
            {triggers.map((trigger) => {
                const fromFrame = Math.round(trigger.startSec * fps);
                const durationInFrames = Math.max(1, Math.round((trigger.endSec - trigger.startSec) * fps));

                return (
                    <Sequence
                        key={trigger.id}
                        from={fromFrame}
                        durationInFrames={durationInFrames}
                        name={`Scene: ${trigger.type}`}
                    >
                        {trigger.type === 'SAAS_PLATFORMS' && (
                            <SaasEcosystemScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'SECURITY_ALERT' && (
                            <RedAlertScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'FILE_HACK' && (
                            <FileBypassScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'DDOS_ATTACK' && (
                            <DdosOverloadScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'AI_PROMPT' && (
                            <AiAuditorScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'SECURITY_SHIELD' && (
                            <ShieldBarrierScene durationInFrames={durationInFrames} />
                        )}

                        {trigger.type === 'CTA_COMMENT' && (
                            <KineticCtaScene
                                durationInFrames={durationInFrames}
                                ctaWord={trigger.ctaWord || 'ZIRH'}
                            />
                        )}
                    </Sequence>
                );
            })}
        </>
    );
};
