import { Cell, HorizontalAlignment, VerticalAlignment } from "./cellTypes";
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

// default Spreadsheet to avoid using "undefined"
const defaultCell: Cell = {
    id: 1,
    sheetId: 1,
    row: 0,
    col: 0,
    protected: false,
    bgColor: "#ffffff",
    color: "#000000",
    style: {},
    hAlignment: HorizontalAlignment.LEFT,
    vAlignment: VerticalAlignment.TOP,
    content: "",
    created: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const defaultSheet: Sheet = {
    id: 1,
    spreadsheetId: 1,
    name: "Sheet 1",
    index: 0,
    color: "#ffffff",
    numRows: 100,
    numCols: 26,
    columnWidths: {},
    rowHeights: {},
    hiddenCols: {},
    hiddenRows: {},
    created: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cells: Array(100 * 26).fill(defaultCell),
};

export const defaultSpreadsheet: Spreadsheet = {
    id: 1,
    ownerId: 1,
    type: SpreadsheetTypes.NORMAL,
    name: "Untitled Spreadsheet",
    lastOpened: new Date().toISOString(),
    sheet: defaultSheet,
    sheetsInfo: [
        {
            id: 1,
            name: "Sheet 1",
            index: 0,
            color: "#ffffff",
        },
    ],
    created: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permission: "EDIT",
};