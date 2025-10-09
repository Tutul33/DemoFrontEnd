import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoucherApproval } from './voucher-approval/voucher-approval';
import { VoucherEntry } from './voucher-entry/voucher-entry';

const routes: Routes = [
  { path: '', redirectTo: 'voucher-approval', pathMatch: 'full' },
  {
    path:'voucher-approval',
    component:VoucherApproval
  },
  {
    path:'voucher-entry',
    component:VoucherEntry
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
