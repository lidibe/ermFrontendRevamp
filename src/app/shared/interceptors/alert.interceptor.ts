import { HttpEvent, HttpRequest, HttpHandlerFn, HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap, catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const successInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  
  const toastrService = inject(ToastrService);

  const EXCLUDED_URLS = [
    '/ms/api/v1/auth/oauth/okta-v3',
    'ms/api/v1/document/get-upload-credentials'
  ];
  const DOCUMENT_URL_PREFIX = '/document/confirm/';
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && !EXCLUDED_URLS.includes(req.url) && !req.url.includes(DOCUMENT_URL_PREFIX)) {
        if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && (event.status === 201 || event.status === 200)) {
          toastrService.success('Operation completed successfully');
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (req.url !== EXCLUDED_URLS[0]) {
        toastrService.error(`${error.error.message || error.message}`);
      }
      return throwError(() => error);
    })
  );
};
