import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RequestLogService } from '../../services/request-log.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

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

  constructor(
    private logService: RequestLogService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder
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
    debugger
    const selectedTimeframe = this.timeframeForm.get('timeframe')?.value;
    const currentTime = new Date();

    switch (selectedTimeframe) {
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
      this.logService.getLogs(this.startTime, this.endTime)
        .subscribe(
          (logs: any) => {
            console.log(logs.data);
            this.logs = logs.data;
          },
          (error) => {
            console.error('Error fetching logs:', error);
            // Handle error appropriately, e.g., show an error message
          }
        );
    }
  }
}
