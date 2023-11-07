import { Component, OnInit } from '@angular/core';
import { RequestLogService } from '../../services/request-log.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgToastService } from 'ng-angular-popup';
import { ApiResponse } from '../../models/api-response';
import { Log } from '../../models/log';

/**
 * Component representing the Request Log feature.
 * - Displays a list of logs with various filtering options.
 * - Utilizes the `RequestLogService` for fetching log data.
 * - Implements a reactive form for time range selection.
 */
@Component({
  selector: 'app-request-log',
  templateUrl: './request-log.component.html',
  styleUrls: ['./request-log.component.css']
})
export class RequestLogComponent implements OnInit {
  logs: Log[] = []; // Array to store retrieved logs
  startTime?: string | null; // Start time for log retrieval
  endTime?: string | null; // End time for log retrieval

  // Reactive Form
  timeframeForm: FormGroup; // Reactive form for time range selection

  selectedTimeframe!: string;

  // Column visibility properties
  showId!: boolean; 
  showTimestamp!: boolean;
  showIpAddress!: boolean; 
  showRequestBody!: boolean; 
  showUsername!: boolean; 

  // Pagination properties
  currentPage!: number; // Current page number for pagination;
  itemsPerPage!: number; // Number of items per page;
  totalItems!: number; // Total number of logs;

  // Constant for the date format string
  private readonly dateFormat!: string;

  /**
   * Constructor for initializing services and dependencies.
   * @param logService - Instance of the RequestLogService for log-related actions.
   * @param datePipe - Angular service for date formatting.
   * @param formBuilder - Angular service for building reactive forms.
   * @param toast - Service for displaying toast notifications.
   */
  constructor(
    private logService: RequestLogService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private toast: NgToastService
  ) {
    
    // Initialize the timeframeForm with default values
    this.timeframeForm = this.formBuilder.group({
      timeframe: ['5'] // Default selection
    });

    // Set the initial value for selectedTimeframe to the default value of '5'
    this.selectedTimeframe = '5';

    // Initialize the column visibility properties
    this.showId = true;
    this.showTimestamp = true;
    this.showIpAddress = true;
    this.showRequestBody = true;
    this.showUsername = true;
    
    // Initialize the pagination properties
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalItems = 0;

    // Initialize the dateFormat constant
    this.dateFormat = 'yyyy-MM-ddTHH:mm:ss';
  }

  /**
   * Lifecycle hook called after Angular has initialized the component.
   * - Sets the default time range.
   * - Fetches logs based on the default time range.
   */
  ngOnInit(): void {
    this.setDefaultTimeRange();
    this.fetchLogs();
  }

  /**
 * Sets the default time range to the last 5 minutes.
 * - Retrieves the current timestamp and calculates the time five minutes ago.
 * - Formats the start and end times using the specified date format.
 * - Updates the component's `startTime` and `endTime` properties.
 */
  setDefaultTimeRange(): void {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);

    this.startTime = this.datePipe.transform(fiveMinutesAgo, this.dateFormat) ?? null;
    this.endTime = this.datePipe.transform(currentTime, this.dateFormat) ?? null;
  }

  /**
 * Handles the selection of a predefined time range.
 * - Retrieves the selected timeframe from the reactive form.
 * - Gets the current timestamp for reference.
 * - Updates the start time based on the selected timeframe.
 * - For predefined options ('5', '10', '30'), calculates the start time relative to the current timestamp.
 * - For the 'custom' option, custom handling can be added using the property `this.customTime`.
 * - Invokes the `fetchLogs` method to retrieve logs with the updated time range.
 */
  selectTimeframe(): void {
    this.selectedTimeframe = this.timeframeForm.get('timeframe')?.value;
    const currentTime = new Date(); // Get the current timestamp

    switch (this.selectedTimeframe) {
      case '5':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 5 * 60 * 1000, this.dateFormat) ?? null;
        break;
      case '10':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 10 * 60 * 1000, this.dateFormat) ?? null;
        break;
      case '30':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 30 * 60 * 1000, this.dateFormat) ?? null;
        break;
      case 'custom':
        break;
      default:
        break;
    }
    this.fetchLogs();
  }

 /**
 * Handles the selection of a predefined time range.
 * - Retrieves the selected timeframe from the reactive form.
 * - Gets the current timestamp for reference.
 * - Updates the start time based on the selected timeframe.
 * - For predefined options ('5', '10', '30'), calculates the start time relative to the current timestamp.
 * - For the 'custom' option, custom handling can be added using the property `this.customTime`.
 * - Invokes the `fetchLogs` method to retrieve logs with the updated time range.
 *
 * @remarks
 * This method retrieves logs based on the selected time range, updating the start time accordingly.
 * It also calculates the number of logs to display on the current page and provides success feedback using a toast notification.
 */
  fetchLogs(): void {
    if (this.startTime && this.endTime) {
      this.logService.getLogs(this.startTime, this.endTime).subscribe({
        next: (logs: ApiResponse<Log[]>) => {
          this.totalItems = logs.data.length;

          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;

          this.logs = logs.data.slice(startIndex, endIndex);
          this.toast.success({ detail: "SUCCESS", summary: logs.message, duration: 3000 });
        }
      });
    }
  }


  /**
 * Handles the submission of a custom time range.
 * - Checks if both start and end times are available.
 * - Invokes the `fetchLogs` method to retrieve logs with the custom time range.
 * - Additional validation or error handling can be added as needed.
 */
  onCustomRangeSubmit(): void {
    if (this.startTime && this.endTime) {
      this.fetchLogs();
    }
  }


  /**
 * Handles the page change event triggered by the pagination component.
 * - Updates the current page based on the event.
 * - Invokes the `fetchLogs` method to retrieve logs for the updated page.
 * @param event - The page change event object.
 */
  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.fetchLogs();
  }
}
