import {
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { GiphyDataService } from '../../services/giphy-data.service';
import { GifResponse } from '../../models/gif-response';
import { ApiResponse } from '../../models/api-response';

@Component({
  selector: 'app-gifs',
  templateUrl: './gifs.component.html',
  styleUrls: ['./gifs.component.css'],
})
export class GifsComponent implements OnInit {

  gifResponse: GifResponse[] = [];

  @Output() gifSelected = new EventEmitter<GifResponse>();

  constructor(private giphyDataService: GiphyDataService) { }

  /**
 * Initializes the component when it is loaded. This method is automatically called
 * by Angular when the component is created.
 * It fetches all GIFs using the 'getAllGifs' method of 'GiphyDataService'.
 * Subscribes to the response and assigns the retrieved GIF data to the 'gifResponse' property.
 */
  ngOnInit(): void {
    this.giphyDataService.getAllGifs().subscribe({
      next: (response: ApiResponse<GifResponse[]>) => {
        this.gifResponse = response.data;
      }
    });
  }

  /**
   * Emits the selected GIF to the parent component.
   * - Passes the selected GIF to the parent component via the 'gifSelected' event emitter.
   *
   * @param selectedGif - The selected GIF to emit to the parent component.
   */
  onSelectedGif(gif: GifResponse) {
    this.gifSelected.emit(gif);
  }
}
