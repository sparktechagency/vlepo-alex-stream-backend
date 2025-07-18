export enum USER_STATUS {
    ACTIVE = "ACTIVE",
    BLOCKED  = "BLOCKED"
};

export enum USER_ROLE {
    SUPER_ADMIN = "SUPER_ADMIN",
    USER = "USER",
    CREATOR = "CREATOR",
}

export const userFilterableFields= [
    'searchTerm',
    'role',
    'status',
]

export const userSearchableFields= [
    'name',
    'email',
    'phone',
]