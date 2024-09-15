import { authTokensFetch } from "../utils/authTokens";

export const fetchUserPhoto = async (userId: number) => {
    return await authTokensFetch(`${import.meta.env.VITE_BACKEND_URL}/user/photo/${userId}`,
        { method: 'GET' }
    );
};