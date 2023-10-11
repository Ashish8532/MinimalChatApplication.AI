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

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
    private toast: NgToastService,
    private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = GetToken.getToken();

    if(authToken)
    {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      })
    }
    return next.handle(request).pipe(
      catchError(error => {
        if(error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            return this.handleUnAuthorizedError(request, next)
          }
        }
        return throwError(() => error);
      })
    );
  }

  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler) { 
    let tokenApiModel = new TokenApiModel();
    tokenApiModel.accessToken = GetToken.getToken()!;
    tokenApiModel.refreshToken = GetToken.getRefreshToken()!;

    return this.authService.refreshToken(tokenApiModel).pipe(
      switchMap((data: TokenApiModel)=> {    
        this.authService.storeRefreshToken(data.refreshToken);
        this.authService.storeToken(data.accessToken);
        req= req.clone({    
          setHeaders: {
            Authorization: `Bearer ${data.accessToken}`,
          }, // "Bearer "+myToken
        })
        return next.handle(req);
      }),
      catchError((err)=> {
        return throwError(() => {
          this.toast.warning({detail: 'Warning', summary: 'Token is expired, Please Login again', duration: 3000 });
          this.authService.logOut();
          this.router.navigate(['login']);
        });
      })
    )
  }
}
