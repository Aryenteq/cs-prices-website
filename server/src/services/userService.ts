import { db } from '../db';

export const getUserPhoto = async (userId: number) => {
    const user = await db.user.findFirst({
        where: {
            uid: userId,
        },
        select: {
            photoURL: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.photoURL) {
        throw new Error('Photo URL not found');
    }

    return user.photoURL;
};
