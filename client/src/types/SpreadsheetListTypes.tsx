export interface Spreadsheet {
    id: number;
    name: string;
    type: string;
    created: string;
    lastOpened: string;
    updatedAt: string;
    ownerName: string;
    permission: 'EDIT' | 'VIEW';
}

export interface Filters {
    owner: 'ALL' | 'ME' | 'OTHER';
    type: 'ALL' | 'NORMAL' | 'CS';
    orderBy: 'LAST_OPENED' | 'NAME' | 'CREATED';
    orderType: 'asc' | 'desc';
}