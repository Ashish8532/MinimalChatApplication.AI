import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { GiphyDataService } from '../../services/giphy-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gifs',
  templateUrl: './gifs.component.html',
  styleUrls: ['./gifs.component.css'],
})
export class GifsComponent implements OnInit, OnDestroy {
  gifs: any[] = [];
  subscription!: Subscription;

  searchGif: string = '';

  @Output() gifSelected = new EventEmitter<any>();

  constructor(private giphyDataService: GiphyDataService) {}

  /**
   * Initializes the GifsComponent.
   * - Calls the 'getGifs' method to retrieve trending GIFs.
   *
   * @remarks
   * This method is called during component initialization and serves as an entry point for setting up
   * the component. It calls the 'getGifs' method to retrieve and display trending GIFs when the component is loaded.
   */
  ngOnInit(): void {
    this.getGifs();
  }

  /**
   * Fetches trending GIFs from the Giphy API.
   * - Calls the GiphyDataService to retrieve trending GIFs.
   * - Subscribes to the response observable and updates the component's GIFs array.
   *
   * @remarks
   * This method is responsible for initiating the retrieval of trending GIFs from the Giphy API.
   * It makes an API call via the GiphyDataService, subscribes to the response, and updates the
   * component's 'gifs' array with the received data.
   */
  getGifs() {
    this.giphyDataService.getTrendingGifs();
    this.subscription = this.giphyDataService
      .getGifs()
      .subscribe((response: any) => {
        console.log('Gifs', response);
        this.gifs = response;
      });
  }

  /**
   * Performs a GIF search based on user input.
   * - Checks if the 'searchGif' property is not empty to ensure a valid search query.
   * - Calls the 'searchGifs' method from the GiphyDataService to retrieve GIFs matching the search query.
   *
   * @remarks
   * This method is triggered when the user initiates a search for GIFs based on their input. It performs a search
   * only if a valid search query is provided, calling the GiphyDataService to retrieve matching GIFs.
   */
  onSearch() {
    if (this.searchGif !== '') {
      this.giphyDataService.searchGifs(this.searchGif);
    }
  }

  /**
   * Emits the selected GIF to the parent component.
   * - Passes the selected GIF to the parent component via the 'gifSelected' event emitter.
   *
   * @param selectedGif - The selected GIF to emit to the parent component.
   */
  onSelectedGif(selectedGif: any) {
    this.gifSelected.emit(selectedGif);
  }

  /**
   * Performs cleanup when the component is destroyed.
   * - Unsubscribes from the 'subscription' to prevent memory leaks when the component is no longer needed.
   *
   * @remarks
   * This method is called when the component is about to be destroyed. It ensures that the 'subscription' to the
   * GIF data is unsubscribed to prevent memory leaks associated with ongoing subscriptions.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
