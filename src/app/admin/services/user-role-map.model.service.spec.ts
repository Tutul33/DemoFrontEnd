import { TestBed } from '@angular/core/testing';

import { UserRoleMapModelService } from './user-role-map.model.service';

describe('UserRoleMapModelService', () => {
  let service: UserRoleMapModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserRoleMapModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
