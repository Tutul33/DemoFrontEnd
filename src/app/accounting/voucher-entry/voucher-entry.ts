import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { VoucherDataService } from '../services/voucher/voucher.data.service';
import { VoucherModelService } from '../services/voucher/voucher.model.service';
import { InformationService } from '../../shared/services/information-service';
import { EntityState } from '../../shared/models/javascriptMethods';

enum VoucherType {
  Payment = 'Payment',
  Receipt = 'Receipt',
  Contra = 'Contra',
  Journal = 'Journal'
}

export interface AccountHead {
  id: number;
  name: string;
  type: 'CashBank' | 'Expense' | 'Income' | 'Liability' | 'Asset';
}

export interface SubLedger {
  id: number;
  name: string;
  parentLedgerIds?: number[];
}

@Component({
  selector: 'app-voucher-entry',
  templateUrl: './voucher-entry.html',
  styleUrls: ['./voucher-entry.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TableModule, ButtonModule, InputTextModule, TextareaModule],
  providers: [VoucherDataService]
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
    { id: 1, name: 'Employee A', parentLedgerIds: [3, 4] },
    { id: 2, name: 'Customer B', parentLedgerIds: [5] },
    { id: 3, name: 'Supplier C', parentLedgerIds: [6] },
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: VoucherDataService,
    public modelSvc: VoucherModelService,
    public infoSvc: InformationService
  ) { }

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

    this.form.get('voucherType')?.valueChanges.subscribe(val => this.onVoucherTypeChange(val));
  }

  get entries(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  onLedgerChange(entry: FormGroup, ledgerId: number) {
    const filtered = this.subLedgers.filter(s => s.parentLedgerIds?.includes(ledgerId));
    entry.patchValue({ subLedgerId: null }); // reset subledger
    entry['filteredSubLedgers'] = filtered;  // optional if you store per row
  }
  
  createEntry(tag: any = EntityState.Added): FormGroup {
    const debitDisabled = this.voucherType === VoucherType.Payment || this.voucherType === VoucherType.Receipt ? true : false;
    const creditDisabled = this.voucherType === VoucherType.Payment || this.voucherType === VoucherType.Receipt ? false : false;

    const group = this.fb.group(
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

    // Dynamic subledger validation
    group.get('accountHeadId')?.valueChanges.subscribe((headId) => {
      const subLedgerCtrl = group.get('subLedgerId');
      const account = this.accountHeads.find(a => a.id === headId);

      if (this.voucherType === VoucherType.Contra) {
        subLedgerCtrl?.clearValidators();
        group.get('debit')?.enable();
        group.get('credit')?.enable();
      } else if (account && account.type !== 'CashBank') {
        subLedgerCtrl?.setValidators(Validators.required);
        group.get('debit')?.enable();
        group.get('credit')?.disable();
      } else if (account && account.type === 'CashBank') {
        subLedgerCtrl?.clearValidators();
        group.get('debit')?.disable();
        group.get('credit')?.enable();
      }

      subLedgerCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    return group;
  }


  initEntries(type: VoucherType) {
    this.entries.clear();

    switch (type) {
      case VoucherType.Payment:
        this.entries.push(this.createEntry()); // debit line
        this.entries.push(this.createEntry()); // credit line
        break;

      case VoucherType.Receipt:
        this.entries.push(this.createEntry());
        this.entries.push(this.createEntry());
        break;

      case VoucherType.Contra:
        this.entries.push(this.createEntry());
        this.entries.push(this.createEntry());
        break;

      case VoucherType.Journal:
        this.addEntry(); // all editable
        break;
    }
  }


  onVoucherTypeChange(type: VoucherType) {
    this.voucherType = type;
    this.initEntries(type);
  }

  addEntry(): void {
    this.entries.push(this.createEntry(EntityState.Added));
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
    const debitDisabled = entry.get('debit')?.disabled;
    const creditDisabled = entry.get('credit')?.disabled;

    if (this.voucherType === VoucherType.Payment) {
      return debitDisabled
        ? this.accountHeads.filter(a => a.type === 'CashBank')
        : this.accountHeads.filter(a => a.type === 'Expense');
    }

    if (this.voucherType === VoucherType.Receipt) {
      return debitDisabled
        ? this.accountHeads.filter(a => a.type === 'Income')
        : this.accountHeads.filter(a => a.type === 'CashBank');
    }

    if (this.voucherType === VoucherType.Contra) {
      return this.accountHeads.filter(a => a.type === 'CashBank');
    }

    return this.accountHeads;
  }

  getFilteredSubLedgers(entry: FormGroup): SubLedger[] {
    const ledgerId = entry.get('accountHeadId')?.value;
    return this.subLedgers.filter(s => s.parentLedgerIds?.includes(ledgerId));
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
      this.infoSvc.showWarningMsg('Total debit must equal total credit and be greater than 0!');
      return;
    }

    if (this.voucherType === VoucherType.Contra) {
      this.entries.controls.forEach(e => e.patchValue({ subLedgerId: null }));
    }

    const payload = this.form.getRawValue();
    this.dataService.saveUpdateVoucher(payload).subscribe({
      next: () => this.infoSvc.showWarningMsg('Voucher saved successfully!'),
      error: (err) => console.error('Save error', err),
    });
  }
}
