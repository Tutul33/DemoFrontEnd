import { TestBed } from '@angular/core/testing';

import { DashboardModelService } from './dashboard.model.service';

describe('DashboardModelService', () => {
  let service: DashboardModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
