import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GifResponse } from '../models/gif-response';
import { ApiResponse } from '../models/api-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GiphyDataService {

  private apiUrl = 'https://localhost:44394/api/gif/all-gifs';

  constructor(private http: HttpClient) {}

  /**
   * Fetches all GIFs from the API.
   * @returns An Observable of ApiResponse<GifResponse[]> containing GIF data.
   */
  getAllGifs(): Observable<ApiResponse<GifResponse[]>> {
    return this.http.get<ApiResponse<GifResponse[]>>(this.apiUrl);
  }
}
