// Eve-BE: ERROR-HANDLER-003 — типизированные HTTP-ошибки для контроллеров и middleware
export class HttpError extends Error {
  readonly statusCode: number;
  readonly code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

