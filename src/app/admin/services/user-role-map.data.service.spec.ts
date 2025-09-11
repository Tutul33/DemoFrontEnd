import { TestBed } from '@angular/core/testing';

import { UserRoleMapDataService } from './user-role-map.data.service';

describe('UserRoleMapDataService', () => {
  let service: UserRoleMapDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleMapDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
