import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleMap } from './user-role-map';

describe('UserRoleMap', () => {
  let component: UserRoleMap;
  let fixture: ComponentFixture<UserRoleMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
