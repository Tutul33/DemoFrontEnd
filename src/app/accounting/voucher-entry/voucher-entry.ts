import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { VoucherDataService } from '../services/voucher/voucher.data.service';
import { VoucherModelService } from '../services/voucher/voucher.model.service';
import { EntityState } from '../../shared/models/javascriptMethods';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
enum VoucherType {
  Payment = 'Payment',
  Receipt = 'Receipt',
  Contra = 'Contra',
  Journal = 'Journal'
}

interface AccountHead {
  id: number;
  name: string;
  type: 'CashBank' | 'Expense' | 'Income' | 'Other';
}

interface SubLedger {
  id: number;
  name: string;
}
@Component({
  selector: 'app-voucher-entry',
  imports: [SelectModule,TableModule,FormsModule,ReactiveFormsModule],
  templateUrl: './voucher-entry.html',
  styleUrl: './voucher-entry.css'
})
export class VoucherEntry {
form!: FormGroup;
  voucherTypes = Object.values(VoucherType);
  voucherType!: VoucherType;

  accountHeads: AccountHead[] = [
    { id: 1, name: 'Cash', type: 'CashBank' },
    { id: 2, name: 'Bank', type: 'CashBank' },
    { id: 3, name: 'Rent Expense', type: 'Expense' },
    { id: 4, name: 'Salary Expense', type: 'Expense' },
    { id: 5, name: 'Sales Income', type: 'Income' },
    { id: 6, name: 'Other Income', type: 'Income' },
  ];

  subLedgers: SubLedger[] = [
    { id: 1, name: 'Employee A' },
    { id: 2, name: 'Customer B' },
    { id: 3, name: 'Supplier C' },
  ];

  constructor(private fb: FormBuilder, private dataService: VoucherDataService,public modelSvc: VoucherModelService,) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      voucherId: [0],
      companyId: [1, Validators.required],
      branchId: [1],
      financialYearId: [1, Validators.required],
      voucherType: [VoucherType.Journal, Validators.required],
      voucherNo: ['', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      narration: [''],
      createdBy: ['admin'],
      modifiedBy: [''],
      entries: this.fb.array([]),
      tag: [EntityState.Added],
    });

    this.voucherType = VoucherType.Journal;
    this.initEntries(this.voucherType);

    this.form.get('voucherType')?.valueChanges.subscribe((val) => {
      this.onVoucherTypeChange(val);
    });
  }

  get entries(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  createEntry(debitDisabled = false, creditDisabled = false, tag: any = EntityState.Added): FormGroup {
    return this.fb.group(
      {
        entryId: [0],
        accountHeadId: [null, Validators.required],
        subLedgerId: [null],
        debit: [{ value: 0, disabled: debitDisabled }, Validators.min(0)],
        credit: [{ value: 0, disabled: creditDisabled }, Validators.min(0)],
        description: [''],
        lineOrder: [this.entries.length + 1],
        tag: [tag],
      },
      { validators: this.debitOrCreditValidator }
    );
  }

  initEntries(type: VoucherType) {
    this.entries.clear();
    switch (type) {
      case VoucherType.Payment:
        this.entries.push(this.createEntry(false, true));
        this.entries.push(this.createEntry(true, false));
        break;

      case VoucherType.Receipt:
        this.entries.push(this.createEntry(false, true));
        this.entries.push(this.createEntry(true, false));
        break;

      case VoucherType.Contra:
        this.entries.push(this.createEntry(false, false));
        this.entries.push(this.createEntry(false, false));
        break;

      case VoucherType.Journal:
        this.addEntry();
        break;
    }
  }

  onVoucherTypeChange(type: VoucherType) {
    this.voucherType = type;
    this.initEntries(type);
  }

  addEntry(): void {
    this.entries.push(this.createEntry(false, false, EntityState.Added));
  }

  removeEntry(index: number): void {
    const entry = this.entries.at(index);
    if (entry.get('entryId')?.value > 0) {
      entry.patchValue({ tag: EntityState.Deleted });
    } else {
      this.entries.removeAt(index);
    }
  }

  debitOrCreditValidator(group: FormGroup) {
    const debit = +group.get('debit')!.value;
    const credit = +group.get('credit')!.value;
    return debit > 0 && credit === 0 || credit > 0 && debit === 0 ? null : { invalidAmount: true };
  }

  getFilteredAccountHeads(entry: FormGroup): AccountHead[] {
    // Filter AccountHeads based on voucher type and whether this line is debit/credit
    const debitDisabled = entry.get('debit')?.disabled;
    const creditDisabled = entry.get('credit')?.disabled;

    if (this.voucherType === VoucherType.Payment) {
      return debitDisabled
        ? this.accountHeads.filter(a => a.type === 'CashBank') // credit line
        : this.accountHeads.filter(a => a.type === 'Expense');  // debit line
    }

    if (this.voucherType === VoucherType.Receipt) {
      return debitDisabled
        ? this.accountHeads.filter(a => a.type === 'Income')   // credit line
        : this.accountHeads.filter(a => a.type === 'CashBank');// debit line
    }

    if (this.voucherType === VoucherType.Contra) {
      return this.accountHeads.filter(a => a.type === 'CashBank');
    }

    return this.accountHeads; // Journal: no restriction
  }

  validateTotals(): boolean {
    const totalDebit = this.entries.controls
      .filter(e => e.get('tag')!.value !== EntityState.Deleted)
      .map(e => +e.get('debit')!.value)
      .reduce((a, b) => a + b, 0);
    const totalCredit = this.entries.controls
      .filter(e => e.get('tag')!.value !== EntityState.Deleted)
      .map(e => +e.get('credit')!.value)
      .reduce((a, b) => a + b, 0);

    return totalDebit === totalCredit && totalDebit > 0;
  }

  saveVoucher(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validateTotals()) {
      alert('Total debit must equal total credit and be greater than 0!');
      return;
    }

    const payload = this.form.getRawValue();
    this.dataService.saveUpdateVoucher(payload).subscribe({
      next: () => alert('Voucher saved successfully!'),
      error: (err) => console.error('Save error', err),
    });
  }
}
