import { HttpHeaders } from "@angular/common/http";
import jwtDecode from "jwt-decode";

export default class GetToken {
    static getToken(): string | null {
        return localStorage.getItem('token');
      }
    
      static decodeToken(token: string): any {
        const decodedToken = jwtDecode(token);
        return decodedToken;
      }

      static getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
      }
   
}
    