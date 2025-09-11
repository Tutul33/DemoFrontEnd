import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { UserRoleMapDataService } from '../services/user-role-map.data.service';
import { UserRoleMapModelService } from '../services/user-role-map.model.service';
import { InformationService } from '../../shared/services/information-service';
import { BooleanToYesNoPipe } from '../../shared/pipes/boolean-to-yes-no-pipe';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LoadingService } from '../../shared/services/loading-service';
import { GlobalMethods } from '../../shared/models/javascriptMethods';
@Component({
  selector: 'app-user-role-map',
  imports: [TableModule, TagModule, IconFieldModule, InputTextModule, InputIconModule, MultiSelectModule, SelectModule, CommonModule, CheckboxModule, ButtonModule, FormsModule, BooleanToYesNoPipe],
  templateUrl: './user-role-map.html',
  styleUrl: './user-role-map.css',

})
export class UserRoleMap {
  @ViewChild('dt2') dt2!: Table;
  @ViewChild('roleFilterBtn') roleFilterBtn!: any;
  @ViewChild('userFilterBtn') userFilterBtn!: any;
  @ViewChild('employeeFilterBtn') employeeFilterBtn!: any;
  loading: boolean = true;

  constructor(
    private dataSvc: UserRoleMapDataService,
    public modelSvc: UserRoleMapModelService,
    private msgSvc: InformationService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.getUserRoleMapList();
  }

  ngAfterViewInit() { }

  checkAll() {
    try {
      this.modelSvc.checkAll();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  clear(table: Table) {
    try {
      this.modelSvc.selectedEmpNames = [];
      this.modelSvc.selectedRoleNames = [];
      this.modelSvc.selectedUserNames = [];
      table.clear();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  getUserRoleMapList() {
    try {
      this.loading = true;
      this.dataSvc.getUserRoleMapList().subscribe({
        next: (response: any) => {
          const res=response.data;
          this.loading = false;
          this.modelSvc.prepareUserMapList(res.list);
        },
        error: (err: any) => {
          this.loading = false;
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      this.loading = false;
      this.msgSvc.showErrorMsg(error);
    }
  }

  onGlobalFilter(event: any) {
    try {
      this.dt2.filterGlobal(event.target.value, 'contains')
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }


  filter(event: any) {
    try {
      if (event?.itemValue?.hasOwnProperty('empName')) {
        this.modelSvc.filterEmpNames = event.value.map(v => v.empName);
      }
      if (event?.itemValue?.hasOwnProperty('userName')) {
        this.modelSvc.filterUserNames = event.value.map(v => v.userName);
      }
      if (event?.itemValue?.hasOwnProperty('roleName')) {
        this.modelSvc.filterRoleNames = event.value.map(v => v.roleName);
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  applyFilters(field?: string) {
    try {
      switch (field) {
        case 'roleName':
          this.dt2.filter(this.modelSvc.filterRoleNames, field, 'in');
          GlobalMethods.closeDropdown(this.roleFilterBtn);
          break;
        case 'empName':
          this.dt2.filter(this.modelSvc.filterEmpNames, field, 'in');
          GlobalMethods.closeDropdown(this.employeeFilterBtn);
          break;
        case 'userName':
          this.dt2.filter(this.modelSvc.filterUserNames, field, 'in');
          GlobalMethods.closeDropdown(this.userFilterBtn);
          break;
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  clearFilters(field?: string) {
    try {
      switch (field) {
        case 'roleName':
          this.dt2.filter([], field, 'in');
          this.modelSvc.filterRoleNames = [];
          this.modelSvc.selectedRoleNames = [];
          GlobalMethods.closeDropdown(this.roleFilterBtn);
          break;
        case 'empName':
          this.dt2.filter([], field, 'in');
          this.modelSvc.filterEmpNames = [];
          this.modelSvc.selectedEmpNames = [];
          GlobalMethods.closeDropdown(this.employeeFilterBtn);
          break;
        case 'userName':
          this.dt2.filter([], field, 'in');
          this.modelSvc.filterUserNames = [];
          this.modelSvc.selectedUserNames = [];
          GlobalMethods.closeDropdown(this.userFilterBtn);
          break;
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  closeDropdown(closeBtn) {
    try {
      closeBtn.nativeElement.click();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  save() {
    try {
      this.loadingService.show();
      setTimeout(() => {
        const data = this.modelSvc.prepareDataBeforeSave();
        this.dataSvc.updateUserRoleMap(data).subscribe({
          next: (res: any) => {
            this.loadingService.hide();
            this.msgSvc.showSuccessMsg("Saved Successfully.");
          },
          error: (err: any) => {
            this.loading = false;
            this.loadingService.hide();
            this.msgSvc.showErrorMsg(err);
          }
        });
      }, 10);
    } catch (error) {
      this.loadingService.hide();
      this.msgSvc.showErrorMsg(error);
    }
  }

}
