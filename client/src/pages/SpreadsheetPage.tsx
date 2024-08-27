import React, { useMemo, useState } from "react";
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '../utils/types';

import SpreadsheetHeader from "../components/Spreadsheet/SpreadsheetHeader";
import SpreadsheetTable from "../components/Spreadsheet/SpreadsheetTable";
import { decryptData } from '../utils/encrypt';

export interface SpreadsheetProps {
    uid: number;
    spreadsheetId: number;
    saving: boolean;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
}


const SpreadsheetPage: React.FC = () => {
    const [saving, setSaving] = useState<boolean>(false);
    const { encodedSpreadsheetId } = useParams<{ encodedSpreadsheetId: string }>();

    const spreadsheetId = useMemo(() => {
        if (encodedSpreadsheetId) {
            try {
                const decodedInfo = decodeURIComponent(encodedSpreadsheetId);
                return parseInt(decryptData(decodedInfo), 10);
            } catch (error) {
                console.error('Failed to decode or decrypt spreadsheetId', error);
                return null;
            }
        }
        return null;
    }, [encodedSpreadsheetId]);

    const jwtInfo = useMemo(() => {
        const storedToken = Cookies.get('token');
        if (storedToken) {
            try {
                return jwtDecode<JwtPayload>(storedToken);
            } catch (error) {
                console.error('Failed to decode token', error);
                return null;
            }
        }
        return null;
    }, []);

    if (!jwtInfo) {
        return <Navigate to="/connect" replace />;
    }

    if (!spreadsheetId) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <SpreadsheetHeader
                uid={jwtInfo.uid}
                spreadsheetId={spreadsheetId}
                saving={saving}
                setSaving={setSaving}
            />
            <SpreadsheetTable
                uid={jwtInfo.uid}
                spreadsheetId={spreadsheetId}
                saving={saving}
                setSaving={setSaving}
            />
        </>
    );
}

export default SpreadsheetPage;