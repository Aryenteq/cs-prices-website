import http from "http";

// temp?
export type Next = () => void;
export type Middleware = (req: Request, res: Response, next: Next) => void;