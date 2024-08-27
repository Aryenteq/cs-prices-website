import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { SpreadsheetProps } from "../../pages/SpreadsheetPage";
import { getAuthHeader } from "../../utils/authHeader";

import { useInfo } from "../InfoContext";

const SpreadsheetUtilities: React.FC<SpreadsheetProps> = ({ uid, spreadsheetId, saving, setSaving }) => {
    return (
        <>
        {uid}
        
        </>
    )
}

export default SpreadsheetUtilities;