import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoEntry } from './demo-entry';

describe('DemoEntry', () => {
  let component: DemoEntry;
  let fixture: ComponentFixture<DemoEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoEntry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
