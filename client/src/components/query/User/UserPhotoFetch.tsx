import { useQuery } from "react-query";
import { fetchUserPhoto } from "../../../fetch/UserFetch";
import { useInfo } from "../../../context/InfoContext";

export const useUserPhotoFetch = (userId: number) => {
    const { setInfo } = useInfo();

    const { data: photoURL, error, isLoading } = useQuery<string, Error>(
        ['userPhoto', userId],
        () => fetchUserPhoto(userId),
        {
            keepPreviousData: true,
            onError: (error: any) => {
                if (error.status !== 401) {
                    console.error('Error fetching user photo:', error);
                }
                const parsedMessage = JSON.parse(error.message);
                const errorMessage = parsedMessage.message || 'An unknown error occurred while fetching user photo.';
                setInfo({ message: errorMessage, isError: true });
            },
        }
    );

    return { photoURL, error, isLoading };
};
