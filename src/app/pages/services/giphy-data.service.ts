import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GiphyDataService {
  /**
   * A BehaviorSubject containing an array of GIF data.
   *
   * @remarks
   * This BehaviorSubject serves as an observable for GIF data. It can be subscribed to by components that need to
   * access the GIF data and will emit new data whenever it is updated.
   */
  gifs = new BehaviorSubject<any>([]);
  constructor(private http: HttpClient) {}

  /**
   * Retrieves trending GIFs from the Giphy API.
   * - Makes an HTTP GET request to the Giphy API to fetch trending GIFs.
   * - Updates the 'gifs' BehaviorSubject with the retrieved GIF data.
   *
   * @remarks
   * This method fetches the latest trending GIFs by making an API request to Giphy. It updates the 'gifs'
   * BehaviorSubject, which in turn notifies subscribers of the new data.
   */
  getTrendingGifs() {
    return this.http
      .get(
        `https://api.giphy.com/v1/gifs/trending?api_key=${environment.giphyApiKey}&limit=48`
      )
      .subscribe((response: any) => {
        this.gifs.next(response.data);
      });
  }

  /**
   * Searches for GIFs based on a provided search query.
   * - Makes an HTTP GET request to the Giphy API to search for GIFs matching the 'gifName' query.
   * - Updates the 'gifs' BehaviorSubject with the retrieved GIF data.
   *
   * @remarks
   * This method performs a search for GIFs based on the provided query ('gifName') by making an API request to Giphy.
   * It updates the 'gifs' BehaviorSubject with the matching GIF data.
   */
  searchGifs(gifName: string) {
    return this.http
      .get(
        `https://api.giphy.com/v1/gifs/search?q=${gifName}&api_key=${environment.giphyApiKey}&limit=48`
      )
      .subscribe((response: any) => {
        this.gifs.next(response.data);
      });
  }

  /**
   * Returns an observable for the GIF data.
   *
   * @remarks
   * This method provides an observable view of the 'gifs' BehaviorSubject, allowing other components to subscribe
   * to it and receive updates to the GIF data.
   */
  getGifs() {
    return this.gifs.asObservable();
  }
}
