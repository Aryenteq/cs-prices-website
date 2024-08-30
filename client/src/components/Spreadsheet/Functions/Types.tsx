export type Sheet = {
    id: number,
    name: number,
    cells: Array<{
        id: number;
        row: number;
        col: number;
        content: string;
        bgColor?: string;
        color?: string;
        hAlignment?: string;
        vAlignment?: string;
    }>;
    index: number,
};