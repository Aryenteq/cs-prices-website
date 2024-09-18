import { useMutation, useQueryClient } from 'react-query';
import { authTokensFetch } from '../../../utils/authTokens';
import { useInfo } from '../../../context/InfoContext';

export const useRenameSpreadsheet = (spreadsheetId: number, newName: string, setRenameDialogOpen: (open: boolean) => void) => {
    const queryClient = useQueryClient();
    const { setInfo } = useInfo();

    return useMutation(
        async () => {
            const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}/name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName }),
            });
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('spreadsheets');
                setRenameDialogOpen(false);
            },
            onError: (error: any) => {
                setInfo({ message: error.message, isError: true });
                if (error.status !== 401) {
                    console.error('Error renaming spreadsheet:', error);
                }
            },
        }
    );
};
