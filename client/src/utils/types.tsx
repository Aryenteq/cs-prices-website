export interface JwtPayload {
  uid: number;
  username: string;
  email: string;
  admin: boolean;
  exp?: number;
}

export interface UserIdProps {
  userId: number
}