export interface SpreadsheetItemProps {
    spreadsheet: {
        id: number;
        name: string;
        type: string;
        created: string;
        lastOpened: string;
        updatedAt: string;
        ownerName: string;
        permission: 'EDIT' | 'VIEW';
    };
    openMenuId: number | null;
    handleMenuToggle: (id: number) => void;
}