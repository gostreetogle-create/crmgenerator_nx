// Eve-arch: 000 — без выделенного паттерна
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { APP_ENVIRONMENT } from './app-environment.token';
import { apiBaseUrlInterceptor } from './api-base-url.interceptor';

describe('apiBaseUrlInterceptor', () => {
  function setup(apiBaseUrl: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
        {
          provide: APP_ENVIRONMENT,
          useValue: { production: false, apiBaseUrl },
        },
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      ctrl: TestBed.inject(HttpTestingController),
    };
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('prefixes relative URL when apiBaseUrl is set', () => {
    const { http, ctrl } = setup('https://api.example.com/v1');
    http.get('organizations').subscribe();
    const req = ctrl.expectOne('https://api.example.com/v1/organizations');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('strips trailing slash from base', () => {
    const { http, ctrl } = setup('https://api.example.com/v1/');
    http.get('/clients').subscribe();
    ctrl.expectOne('https://api.example.com/v1/clients').flush([]);
  });

  it('does not modify request when apiBaseUrl is empty', () => {
    const { http, ctrl } = setup('');
    http.get('/organizations').subscribe();
    ctrl.expectOne('/organizations').flush([]);
  });

  it('does not modify absolute http(s) URLs', () => {
    const { http, ctrl } = setup('https://api.example.com');
    http.get('https://other.example/x').subscribe();
    ctrl.expectOne('https://other.example/x').flush({});
  });
});
