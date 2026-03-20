import { HttpError } from '../errors/HttpError';

export function getParamString(value: unknown, name: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  throw new HttpError(400, `Invalid ${name}`);
}

