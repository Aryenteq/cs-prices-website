import type { Sheet } from "./sheetTypes";

export enum SpreadsheetTypes {
    NORMAL = 'NORMAL',
    CS = 'CS',
}

export interface SheetInfo {
    id: number;
    name: string;
    index: number;
    color: string;
}

export interface Spreadsheet {
    id: number;
    ownerId: number;
    type: SpreadsheetTypes;
    name: string;
    lastOpened: string;
    sheet: Sheet;
    sheetsInfo: SheetInfo[];
    created: string;
    updatedAt: string;
    permission: 'EDIT' | 'VIEW';
}