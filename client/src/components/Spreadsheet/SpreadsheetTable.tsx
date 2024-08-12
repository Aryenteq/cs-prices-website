import React from "react";

interface SpreadsheetTableProps {
    type: 'normal' | 'cs'
}

const SpreadsheetTable: React.FC<SpreadsheetTableProps> = ({ type }) => {
    return (
        <>
            {type}
        </>
    );
}

export default SpreadsheetTable;