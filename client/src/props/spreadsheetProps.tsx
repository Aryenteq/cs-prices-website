import type { Spreadsheet } from "../types/spreadsheetTypes";

export interface SpreadsheetProps {
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCellsId: number[];
    spreadsheet: Spreadsheet | undefined;
    setSpreadsheet: React.Dispatch<React.SetStateAction<Spreadsheet | undefined>>;
    setCurrentFontFamily: React.Dispatch<React.SetStateAction<string>>;
    setCurrentFontSize: React.Dispatch<React.SetStateAction<number>>;
    setCurrentTextColor: React.Dispatch<React.SetStateAction<string>>;
    setCurrentBgColor: React.Dispatch<React.SetStateAction<string>>;
}

export interface SpreadsheetHeaderProps {
    spreadsheetId: number;
    saving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}