import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = "https://localhost:44394/api/user";
  constructor(private http: HttpClient) { }

  getUserList() {
    return this.http.get<any>(this.baseUrl)
  }
}
