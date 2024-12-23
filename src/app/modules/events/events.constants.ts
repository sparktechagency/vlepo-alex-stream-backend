export enum EVENTS_STATUS {
    UPCOMING = "UPCOMING",
    LIVE = "LIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export enum EVENTS_TYPE {
    VIRTUAL = "VIRTUAL",
    OFFLINE = "OFFLINE"
}


export const EventSearchableFields = [
    'eventName',
    'description',
    "eventType",
    // "ticketPrice",
]; 


