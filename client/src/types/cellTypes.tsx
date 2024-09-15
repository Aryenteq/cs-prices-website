export type SelectedCellsContent = {
    [rowIndex: number]: {
        [colIndex: number]: string | null;
    }
};

export type TextAlign = 'left' | 'right' | 'center' | 'justify';

export enum HorizontalAlignment {
    LEFT = "LEFT",
    CENTER = "CENTER",
    RIGHT = "RIGHT"
}

export enum VerticalAlignment {
    TOP = "TOP",
    CENTER = "CENTER",
    BOTTOM = "BOTTOM"
}

export interface Cell {
    id: number;
    sheetId: number;
    row: number;
    col: number;
    protected: boolean;
    bgColor: string;
    color: string;
    style?: Record<string, any>;
    hAlignment: HorizontalAlignment;
    vAlignment: VerticalAlignment;
    content?: string;
    created: string;
    updatedAt: string;
}