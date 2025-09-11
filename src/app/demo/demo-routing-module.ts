import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoEntry } from './demo-entry/demo-entry';
import { DemoList } from './demo-list/demo-list';

const routes: Routes = [
  { path: '', redirectTo: 'demo-entry', pathMatch: 'full' },
  {
    path: 'demo-entry',
    component: DemoEntry
  },
  {
    path: 'demo-list',
    component: DemoList
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
