// Eve-arch: 000 — без выделенного паттерна
export interface AppEnvironment {
  production: boolean;
  /**
   * Базовый URL API без завершающего слэша.
   * Пустая строка — фичи продолжают использовать localStorage (текущий MVP).
   */
  apiBaseUrl: string;
}
