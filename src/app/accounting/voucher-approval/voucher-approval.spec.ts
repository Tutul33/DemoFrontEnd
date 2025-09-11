import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherApproval } from './voucher-approval';

describe('VoucherApproval', () => {
  let component: VoucherApproval;
  let fixture: ComponentFixture<VoucherApproval>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherApproval]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherApproval);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
