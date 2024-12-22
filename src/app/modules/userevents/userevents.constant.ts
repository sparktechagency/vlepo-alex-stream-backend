export const USER_EVENT_TYPE = {
    SAVED: "SAVED",
    HISTORY: "HISTORY"
} as const;

export type TEventType = keyof typeof USER_EVENT_TYPE;
