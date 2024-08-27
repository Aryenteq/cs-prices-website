import React from "react";
import { SpreadsheetProps } from "../../pages/SpreadsheetPage";

const SpreadsheetTable: React.FC<SpreadsheetProps> = ({ uid, spreadsheetId, saving, setSaving }) => {


    return (
        <>
            uid: {uid}, spreadsheetId: {spreadsheetId}
        </>
    );
}

export default SpreadsheetTable;