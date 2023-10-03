import { HttpHeaders } from "@angular/common/http";
import jwtDecode from "jwt-decode";

export default class GetToken {
    static getToken(): string | null {
        return localStorage.getItem('token');
      }
    
      // Add JWT token to headers
    static getHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
      }

      static decodeToken(token: string): any {
        const decodedToken = jwtDecode(token);
        return decodedToken;
      }
}
    