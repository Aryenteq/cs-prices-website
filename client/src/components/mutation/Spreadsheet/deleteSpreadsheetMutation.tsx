import { useMutation, useQueryClient } from 'react-query';
import { authTokensFetch } from '../../../utils/authTokens';
import { useInfo } from '../../../context/InfoContext';

export const useDeleteSpreadsheet = (spreadsheetId: number, setDeleteDialogOpen: (open: boolean) => void) => {
    const queryClient = useQueryClient();
    const { setInfo } = useInfo();

    return useMutation(
        async () => {
            const data = await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/spreadsheet/${spreadsheetId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return data;
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries('spreadsheets');
                setDeleteDialogOpen(false);
            },
            onError: (error: any) => {
                setInfo({ message: error.message, isError: true });
                if (error.status !== 401) {
                    console.error('Error deleting spreadsheet:', error);
                }
            },
        }
    );
};
