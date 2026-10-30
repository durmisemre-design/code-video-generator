export interface CaptionItem {
    text: string;
    highlight?: string;
    startSec: number;
    endSec: number;
}

export type TriggerType =
    | 'SAAS_PLATFORMS'
    | 'SECURITY_ALERT'
    | 'FILE_HACK'
    | 'DDOS_ATTACK'
    | 'AI_PROMPT'
    | 'SECURITY_SHIELD'
    | 'CTA_COMMENT';

export interface TriggerItem {
    id: string;
    type: TriggerType;
    startSec: number;
    endSec: number;
    title?: string;
    description?: string;
    ctaWord?: string;
}

export interface VideoData {
    fps: number;
    durationInSeconds: number;
    durationInFrames: number;
    captions: CaptionItem[];
    triggers: TriggerItem[];
}
