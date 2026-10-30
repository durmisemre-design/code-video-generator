import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { TriggerItem } from '../../types/video';
import { SaasPlatformsCard } from './SaasPlatformsCard';
import { SecurityAlertCard } from './SecurityAlertCard';
import { FileHackCard } from './FileHackCard';
import { DdosAttackCard } from './DdosAttackCard';
import { AiPromptCard } from './AiPromptCard';
import { SecurityShieldCard } from './SecurityShieldCard';
import { CtaCommentCard } from './CtaCommentCard';

interface TriggerManagerProps {
    triggers: TriggerItem[];
}

export const TriggerManager: React.FC<TriggerManagerProps> = ({ triggers }) => {
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
                            <SaasPlatformsCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'SECURITY_ALERT' && (
                            <SecurityAlertCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'FILE_HACK' && (
                            <FileHackCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'DDOS_ATTACK' && (
                            <DdosAttackCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'AI_PROMPT' && (
                            <AiPromptCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'SECURITY_SHIELD' && (
                            <SecurityShieldCard
                                durationInFrames={durationInFrames}
                                title={trigger.title}
                                description={trigger.description}
                            />
                        )}

                        {trigger.type === 'CTA_COMMENT' && (
                            <CtaCommentCard
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
