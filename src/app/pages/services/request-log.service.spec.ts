import { TestBed } from '@angular/core/testing';

import { RequestLogService } from './request-log.service';

describe('RequestLogService', () => {
  let service: RequestLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
