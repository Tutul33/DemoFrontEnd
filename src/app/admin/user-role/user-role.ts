import { Component } from '@angular/core';
import { UserRoleMapModelService } from '../services/user-role-map.model.service';
import { UserRoleMapDataService } from '../services/user-role-map.data.service';
import { InformationService } from '../../shared/services/information-service';
import { TableModule } from 'primeng/table';
import { BooleanToYesNoPipe } from '../../shared/pipes/boolean-to-yes-no-pipe';

@Component({
  selector: 'app-user-role',
  imports: [TableModule, BooleanToYesNoPipe],
  templateUrl: './user-role.html',
  styleUrl: './user-role.css'
})
export class UserRole {
  userRoles!: any[];

  constructor(
    private dataSvc: UserRoleMapDataService,
    public modelSvc: UserRoleMapModelService,
    public msgSvc: InformationService
  ) { }

  ngOnInit() {
    this.getUserRoles();
  }

  getUserRoles() {
    try {
      this.dataSvc.getFinanceAndAccountUsersRole().subscribe({
        next: (res) => {
          this.userRoles = res.data?.list;
        },
        error: (error) => {
          this.msgSvc.showErrorMsg(error);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }
}
