import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherEntry } from './voucher-entry';

describe('VoucherEntry', () => {
  let component: VoucherEntry;
  let fixture: ComponentFixture<VoucherEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VoucherEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
