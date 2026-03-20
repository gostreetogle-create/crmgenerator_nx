import { HttpErrorResponse } from '@angular/common/http';

/** Человекочитаемое сообщение из ответа Angular HttpClient. */
export function httpErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (err.status) {
      return `Ошибка ${err.status}${err.statusText ? `: ${err.statusText}` : ''}`;
    }
    return err.message || 'Сеть недоступна';
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Произошла ошибка запроса';
}
