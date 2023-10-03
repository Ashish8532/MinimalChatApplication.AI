import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/pages/services/auth.service';
import GetToken from '../helpers/get-token';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
    private toast: NgToastService,
    private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    debugger
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
      catchError((err:any) => {
        if(err instanceof HttpErrorResponse) {
          if(err.status === 401) {
            this.toast.warning({detail:"Warning", summary:"Token is expired, Please Login again!"});
            this.router.navigate(['login']);
          }
        }
        return throwError(() => new Error("Some other error occured"));
      })
    );
  }
}
