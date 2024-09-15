import type { Cell } from "./cellTypes";

export interface Sheet {
    id: number;
    spreadsheetId: number;
    name: string;
    index: number;
    color: string;
    numRows: number;
    numCols: number;
    columnWidths?: Record<number, number>;
    rowHeights?: Record<number, number>;
    hiddenCols?: Record<number, boolean>;
    hiddenRows?: Record<number, boolean>;
    created: string;
    updatedAt: string;
    cells: Cell[];
}

export interface ItemsVisibility {
    index: number;
    hidden: boolean;
}