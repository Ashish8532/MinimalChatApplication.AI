import { Component, OnInit } from '@angular/core';
import { RequestLogService } from '../../services/request-log.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-request-log',
  templateUrl: './request-log.component.html',
  styleUrls: ['./request-log.component.css']
})
export class RequestLogComponent implements OnInit{
  logs: any[] = [];
  startTime?: string | null;
  endTime?: string | null;

  // Reactive Form
  timeframeForm: FormGroup;
  selectedTimeframe: string = '5'; // Default selection

  // Column visibility properties
  showId: boolean = true;
  showTimestamp: boolean = true;
  showIpAddress: boolean = true;
  showRequestBody: boolean = true;
  showUsername: boolean = true;

  currentPage: number = 1;
  itemsPerPage: number = 5; // Set the number of items per page
  totalItems: number = 0;
  constructor(
    private logService: RequestLogService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private toast: NgToastService
  ) {
    this.timeframeForm = this.formBuilder.group({
      timeframe: ['5'] // Default selection
    });
  }

  ngOnInit(): void {
    this.setDefaultTimeRange();
    this.fetchLogs();
  }

  setDefaultTimeRange(): void {
    const currentTime = new Date();
    const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);

    this.startTime = this.datePipe.transform(fiveMinutesAgo, 'yyyy-MM-ddTHH:mm:ss') || null;
    this.endTime = this.datePipe.transform(currentTime, 'yyyy-MM-ddTHH:mm:ss') || null;
  }

  selectTimeframe(): void {
    this.selectedTimeframe = this.timeframeForm.get('timeframe')?.value;
    const currentTime = new Date();

    switch (this.selectedTimeframe) {
      case '5':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 5 * 60 * 1000, 'yyyy-MM-ddTHH:mm:ss') || null;
        break;
      case '10':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 10 * 60 * 1000, 'yyyy-MM-ddTHH:mm:ss') || null;
        break;
      case '30':
        this.startTime = this.datePipe.transform(currentTime.getTime() - 30 * 60 * 1000, 'yyyy-MM-ddTHH:mm:ss') || null;
        break;
      case 'custom':
        // Handle custom time range here using this.customTime
        break;
      default:
        break;
    }
    this.fetchLogs();
  }

  fetchLogs(): void {
    if (this.startTime && this.endTime) {
      this.logService.getLogs(this.startTime, this.endTime).subscribe({
        next: (logs: any) => {
          console.log(logs.data);

          this.totalItems = logs.data.length;

          const startIndex = (this.currentPage - 1) * this.itemsPerPage;
          const endIndex = startIndex + this.itemsPerPage;

          this.logs = logs.data.slice(startIndex, endIndex);
          this.toast.success({detail:"SUCCESS", summary:logs.message, duration:3000});
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 400 || err.status === 404 || err.status === 500) {
            // Display the error message to the user
            this.toast.error({detail:"ERROR", summary:err.error.message, duration:3000});
          } else {
            this.toast.error({detail:"ERROR", summary: "Something went wrong while processing the request.", duration:3000});
          }
        }
      });
    }
  }
  
  onCustomRangeSubmit(): void {
    if (this.startTime && this.endTime) {
      this.fetchLogs();
    } else {
      // You can show an error message or perform other validation logic
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.fetchLogs();
  }
}
