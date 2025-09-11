import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoucherApproval } from './voucher-approval/voucher-approval';

const routes: Routes = [
  { path: '', redirectTo: 'voucher-approval', pathMatch: 'full' },
  {
    path:'voucher-approval',
    component:VoucherApproval
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountingRoutingModule { }
