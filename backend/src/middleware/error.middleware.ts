import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || "Something went wrong on the server";

  res.status(status).json({ message });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}
