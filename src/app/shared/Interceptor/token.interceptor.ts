import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/app/pages/services/auth.service';
import GetToken from '../helpers/get-token';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { TokenApiModel } from '../models/TokenApiModel';
import { WarningMessage } from '../constant/toast-message';

/**
 * HTTP Interceptor to add authorization token to outgoing requests and handle token refresh on 401 errors.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  /**
   * Constructor to inject required services.
   * @param authService - The authentication service.
   * @param toast - The toast service for displaying messages.
   * @param router - The Angular router service.
   */
  constructor(private authService: AuthService,
    private toast: NgToastService,
    private router: Router) { }


  /**
 * Intercept method to add authorization token to outgoing requests and handle token refresh on 401 errors.
 * @param request - The HTTP request.
 * @param next - The HTTP handler for the next interceptor or the backend.
 * @returns An observable of the HTTP event.
 */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = GetToken.getToken();

    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    }
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            return this.handleUnAuthorizedError(request, next)
          }
        }
        return throwError(() => error);
      })
    );
  }


  /**
   * Handles the case when a 401 Unauthorized error is encountered by attempting to refresh the access token.
   * @param req - The HTTP request.
   * @param next - The HTTP handler for the next interceptor or the backend.
   * @returns An observable of the HTTP event after handling the error.
   */
  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler) {
    let tokenApiModel = new TokenApiModel();
    tokenApiModel.accessToken = GetToken.getToken()!;
    tokenApiModel.refreshToken = GetToken.getRefreshToken()!;

    return this.authService.refreshToken(tokenApiModel).pipe(
      switchMap((data: TokenApiModel) => {
        this.authService.storeRefreshToken(data.refreshToken);
        this.authService.storeToken(data.accessToken);
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        })
        return next.handle(req);
      }),
      catchError((err) => {
        return throwError(() => {
          this.toast.warning({ detail: 'Warning', summary: WarningMessage.TokenExpired, duration: 3000 });
          this.authService.logOut();
          this.router.navigate(['login']);
        });
      })
    )
  }
}
