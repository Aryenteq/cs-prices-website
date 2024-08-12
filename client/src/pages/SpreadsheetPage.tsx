import React, { useState, useEffect } from "react";

import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetTable from "../components/Spreadsheet/SpreadsheetTable";

const SpreadsheetPage: React.FC = () => {
    const [spreadsheetType, setSpreadsheetType] = useState<'normal' | 'cs'>('normal');

    useEffect(() => {
        const fetchSpreadsheetType = async () => {
            // TODO
            const typeFromBE: 'normal' | 'cs' = 'normal';
            setSpreadsheetType(typeFromBE);
        };

        fetchSpreadsheetType();
    }, []);


    return (
        <>
            <SpreadsheetHeader />
            <SpreadsheetTable type={spreadsheetType} />
        </>
    );
}

export default SpreadsheetPage;