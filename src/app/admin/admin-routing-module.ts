import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRoleMap } from './user-role-map/user-role-map';
import { UserRole } from './user-role/user-role';

const routes: Routes = [
  { path: '', redirectTo: 'user-role-map', pathMatch: 'full' },
  { path: 'user-role-map', component: UserRoleMap },
  { path: 'user-role', component: UserRole }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
