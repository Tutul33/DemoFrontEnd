import { ChangeDetectorRef, Component, viewChild, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VoucherDataService } from '../services/voucher/voucher.data.service';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { InformationService } from '../../shared/services/information-service';
import { DialogModule } from 'primeng/dialog';
import { VoucherModelService } from '../services/voucher/voucher.model.service';
import { debounceTime, Observable, Subject } from 'rxjs';
import { TreeSelectModule } from 'primeng/treeselect';
import { VoucherItem } from '../models/voucher.model';
import { Authsvc } from '../../shared/services/authsvc';
import { ConfirmationDialogService } from '../../shared/services/confirm-dialog.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Referral } from '../models/Referral.model';
import { TextareaModule } from 'primeng/textarea';
import { GlobalMethods } from '../../shared/models/javascriptMethods';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../shared/store/auth.selectors';
import { ReportDataService } from '../../shared/services/report-data-service';


@Component({
  selector: 'app-voucher-approval',
  imports: [
    ReactiveFormsModule,
    TableModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    MultiSelectModule,
    SelectModule,
    FormsModule,
    CommonModule,
    ButtonModule,
    DatePickerModule,
    ToastModule,
    TreeSelectModule,
    DialogModule,
    ConfirmPopupModule,
    TextareaModule
  ],
  templateUrl: './voucher-approval.html',
  styleUrl: './voucher-approval.css',
  providers: [
    VoucherDataService
  ]
})
export class VoucherApproval {
  loggedUser$: Observable<any | null>;
  //Search Parameter
  search: any = '';
  fromDate: any;
  toDate: any;
  voucherType: any;
  visibleModal: boolean = false;
  financeBankingUser: any;
  @ViewChild('voucherFilterBtn') voucherFilterBtn!: any;
  @ViewChild('userFilterBtn') userFilterBtn!: any;
  sortByEntryDate: string = 'ASC';
  sortOrder: number = 1;
  referralForm!: FormGroup;
  rowsPerPageOptions: any = GlobalMethods.rowsPerPageOptions;
  pageNumber: number = GlobalMethods.pageNumber;
  pageSize: number = GlobalMethods.pageSize;
  //
  reportRenderingType:any=GlobalMethods.reportRenderingType;
  userIds: any = '';
  voucherNos: any = '';
  totalRecords: number = 0;
  listVoucher: any[] = [];
  ddlUsers: any[] = [];
  ddlVoucherNos: any[] = [];
  selectedUsers: any[] = [];
  selectedVoucherNos: any[] = [];
  loading: boolean = true;


  @ViewChild('dt2') dt2!: Table;
  private searchDebounce$ = new Subject<void>();
  isShowDetailVoucher: boolean = false;
  constructor(
    private store: Store,
    private fb: FormBuilder,
    private dataSvc: VoucherDataService,
    public modelSvc: VoucherModelService,
    private route: ActivatedRoute,
    private msgSvc: InformationService,
    private confirmDialog: ConfirmationDialogService,    
    private reportSvc:ReportDataService
  ) {
    this.loggedUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    this.searchDebounce$.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.loadVoucherApprovalList();
    });

    this.route.queryParams.subscribe(params => {
      this.modelSvc.status = params['status'] || '';
      this.modelSvc.year = params['year'] || '';
      this.setFilterDate();
      this.isShowDetailVoucher = false;
      this.userIds = '';
      this.voucherNos = '';
      this.search = '';
      this.voucherType = '';
      this.selectedUsers = [];
      this.selectedVoucherNos = [];
      this.onLazyLoad({ first: 0, rows: this.pageSize });
    });

    this.createReferralForm();
    setTimeout(() => {
      this.getChartOfAccounts();
      this.setLoggedUserInfo();
      this.getFinanceAndAccountUsers();
    }, 0);
  }

  private setFilterDate() {
    try {
      const year = this.modelSvc.year;

      if (
        year &&
        !isNaN(Number(year)) &&
        year.toString().length === 4 &&
        Number(year) >= 2012
      ) {
        const currentDate = new Date();
        this.fromDate = new Date(Number(year), currentDate.getMonth(), currentDate.getDate());
        this.toDate = new Date(Number(year), currentDate.getMonth(), currentDate.getDate());
      } else {
        this.fromDate = new Date();
        this.toDate = new Date();
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  createReferralForm() {
    try {
      this.referralForm = this.fb.group({
        id: null,
        voucherNo: null,
        refBy: null,
        refTo: [null, Validators.required],
        refType: null,
        comments: [null, Validators.required],
        referDate: null
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  setLoggedUserInfo() {
    try {
      this.loggedUser$.subscribe(user => {
        if (user) {
          this.modelSvc.loggedBy = user.userName;
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  onLazyLoad(event: any) {
    try {
      this.loading = true;
      this.pageNumber = event.first / event.rows + 1;
      this.pageSize = event.rows;
      this.loadVoucherApprovalList();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  searchFilter() {
    try {
      this.pageNumber = 1;
      this.pageSize = 50;
      this.userIds = '';
      this.voucherNos = '';
      this.selectedUsers = [];
      this.selectedVoucherNos = [];
      this.isShowDetailVoucher = false;
      this.searchDebounce$.next();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  resetFilter() {
    try {
      this.pageNumber = 1;
      this.pageSize = 50;
      this.userIds = '';
      this.voucherNos = '';
      this.selectedUsers = [];
      this.selectedVoucherNos = [];
      this.isShowDetailVoucher = false;
      this.financeBankingUser = "";
      this.searchDebounce$.next();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  loadVoucherApprovalList() {
    if (!this.fromDate && !this.toDate) {
      this.msgSvc.showWarningMsg("Please select FromDate and ToDate.");
      return;
    }
    if (this.fromDate > this.toDate) {
      this.msgSvc.showWarningMsg("FromDate can not be greater than ToDate.");
      return;
    }
    if (this.financeBankingUser != undefined) {
      if (this.financeBankingUser.length > 0) {
        if (this.userIds.length) {
          if (!this.userIds.includes(this.financeBankingUser)) {
            this.userIds = ',' + this.financeBankingUser;
          }
        } else {
          this.userIds = this.financeBankingUser;
        }
      }
    }
    this.loading = true;
    this.dataSvc.getVoucherApprovalList(this.search, this.fromDate, this.toDate, this.voucherType, this.userIds || '', this.voucherNos || '', this.modelSvc.status, this.pageNumber, this.pageSize).subscribe({
      next: (response: any) => {
        const res=response.data;
        if (res) {
          this.listVoucher = res.list;
          this.totalRecords = this.listVoucher.length ? this.listVoucher[0].totalCount : 0;
          this.loading = false;
          this.getDistinctList();

        }
      },
      error: err => {
        this.loading = false;
        console.error('Data load failed', err);
      }
    });
  }

  sortData() {
    try {
      this.sortOrder = this.sortOrder == 1 ? -1 : 1;
      this.listVoucher = this.modelSvc.prepareSortData({ sortField: 'entryDate', sortOrder: this.sortOrder }, this.listVoucher)
    } catch (error) {
      console.error('Data load failed', error);
    }
  }

  getDistinctList() {
    try {
      this.ddlUsers = this.modelSvc.getDistinctUserIds(this.listVoucher);
      this.ddlVoucherNos = this.modelSvc.getDistinctVoucherNos(this.listVoucher);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  onGlobalFilter(event: Event) {
    try {
      const input = event.target as HTMLInputElement | null;
      if (input) {
        this.search = input.value;
        this.searchDebounce$.next();
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  filter(event: any) {
    try {
      this.pageNumber = 1;
      this.pageSize = 10;
      if (event.itemValue && event.itemValue.hasOwnProperty('voucherNo')) {
        if (event.value.length > 0) {
          this.voucherNos = event.value.map(v => v.voucherNo).join(',');
        }
      }
      if (event.itemValue && event.itemValue.hasOwnProperty('userId')) {
        if (event.value.length > 0) {
          this.userIds = event.value.map(v => v.userId).join(',');
        }
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  clear(table: Table) {
    try {
      this.userIds = '';
      this.voucherNos = '';
      this.search = '';
      this.voucherType = '';
      this.selectedUsers = [];
      this.selectedVoucherNos = [];
      table.clear();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  applyFilters(field) {
    try {
      this.closeFilterDropDown(field);
      this.pageNumber = 1;
      this.onLazyLoad({ first: 0, rows: this.pageSize });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  clearFilters(field) {
    try {
      switch (field) {
        case 'voucherNo':
          this.selectedVoucherNos = [];
          this.voucherNos = '';
          GlobalMethods.closeDropdown(this.voucherFilterBtn);
          break;
        case 'userId':
          this.selectedUsers = [];
          this.userIds = '';
          GlobalMethods.closeDropdown(this.userFilterBtn);
          break;
      }
      this.pageNumber = 1;
      this.onLazyLoad({ first: 0, rows: this.pageSize });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  closeFilterDropDown(field) {
    try {
      switch (field) {
        case 'voucherNo':
          GlobalMethods.closeDropdown(this.voucherFilterBtn);
          break;
        case 'userId':
          GlobalMethods.closeDropdown(this.userFilterBtn);
          break;
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  //REGION Voucher Detail
  getChartOfAccounts() {
    try {
      this.dataSvc.getChartOfAccounts().subscribe({
        next: (response: any) => {
          const res=response.data;
          if (res) {
            if (res.list.length > 0) {
              this.modelSvc.prepareBaseChartAccounts(res.list);
            }
          }
        },
        error: err => {
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  getFinanceAndAccountUsers() {
    try {
      this.dataSvc.GetFinanceAndAccountUsers().subscribe({
        next: (response: any) => {
          const res=response.data;
          if (res) {
            if (res.list.length > 0) {
              this.modelSvc.listFinanceBankingUser = res.list;
            }
          }
        },
        error: err => {
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  getLedgerOnSelect(voucherItem) {
    try {

      if (voucherItem.node.accLevel == 4) {
        this.modelSvc.getSubLedgerOnSelect(voucherItem);
      }

    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  onSubLedgerOnSelect(voucherItem) {
    try {

      this.modelSvc.setVoucherDataOnSubLedgerChange(voucherItem);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  getLedgerOnSelectAdd(voucherItem) {
    try {
      if (voucherItem.node.accLevel == 4) {
        this.modelSvc.getSubLedgerOnSelectAdd(voucherItem);
      }

    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  onSubLedgerOnSelectAdd(voucherItem) {
    try {
      this.modelSvc.setVoucherDataAddSubLedger(voucherItem);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  addNewVoucherItem() {
    try {
      this.modelSvc.addNewVoucherItem(this.modelSvc.voucherItem);
      //this.cd.detectChanges();
      this.modelSvc.node = null;
      this.modelSvc.subLedgerNode = null;
      this.modelSvc.voucherItem = new VoucherItem();;
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  removeVoucherItem(item) {
    try {
      this.modelSvc.removeVoucherItem(item);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  onAmountChange(voucherItem) {
    try {
      if (voucherItem.dAmount > 0) {
        voucherItem.cAmount = 0;
      }
      if (voucherItem.cAmount > 0) {
        voucherItem.dAmount = 0;
      }
    } catch (error) {

    }
  }

  showDetailsToggle(voucher) {
    try {
      this.isShowDetailVoucher = !this.isShowDetailVoucher;
      if (this.isShowDetailVoucher) {
        voucher.voucherItem = new VoucherItem();
        this.getVoucherDetails(voucher);
      } else {
        setTimeout(() => {
          this.clear(this.dt2);
        }, 5);
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  getVoucherDetails(voucher) {
    try {
      this.dataSvc.getVoucherDetailByVoucherNo(voucher.voucherNo).subscribe({
        next: (response: any) => {
          const res=response.data;
          if (res) {console.log(res)
            const listVoucher = res.voucherList;
            if (listVoucher && listVoucher.length > 0) {
              this.modelSvc.prepareVoucherDetails(listVoucher);
            }
            const referralList = res.referralList;
            if (referralList.length > 0) {
              this.modelSvc.prepareReferralData(referralList);
            } else {
              this.modelSvc.referralList = [];
            }
          }
        },
        error: err => {
          this.msgSvc.showErrorMsg(err);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  confirmUpdateVoucher(event: Event) {
    this.confirmDialog.confirm({
      event,
      message: 'Do you really want to proceed?',
      acceptLabel: 'Proceed',
      rejectLabel: 'Cancel',
      onAccept: () => {
        this.updateVoucher();
      },
      onReject: () => {

      }
    });
  }

  updateVoucher() {
    try {
      const data = this.modelSvc.prepareBeforeSave();
      if (this.modelSvc.status == 'check-pending' || this.modelSvc.status == 'approval-pending') {
        this.dataSvc.UpdateVoucherCheckApprove(data).subscribe({
          next: (response: any) => {
          const res=response.data;
            if (res) {
              this.isShowDetailVoucher = false;
            }
          },
          error: err => {
            this.msgSvc.showErrorMsg(err);
          }
        });
      } else {
        this.dataSvc.updateVoucher(data).subscribe({
          next: (response: any) => {
          const res=response.data;
            if (res) {
              this.isShowDetailVoucher = false;
            }
          },
          error: err => {
            this.msgSvc.showErrorMsg(err);
          }
        });
      }

    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  confirmReferVoucher(event: Event) {
    if (this.referralForm.invalid) return;
    this.confirmDialog.confirm({
      event,
      message: 'Do you really want to proceed?',
      acceptLabel: 'Proceed',
      rejectLabel: 'Cancel',
      onAccept: () => {
        this.referVoucher();
      },
      onReject: () => {

      }
    });
  }

  referVoucher() {
    try {
      const data = this.modelSvc.prepareReferDataBeforeSave(this.referralForm.value);
      this.dataSvc.referVoucher(data).subscribe({
        next: (response: any) => {
          const res=response.data;
          if (res) {
            this.isShowDetailVoucher = false;
            this.visibleModal = false;
          }
        },
        error: err => {
          this.loading = false;
          console.error('Data load failed', err);
        }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  showDialogReferral() {
    try {
      this.modelSvc.referralModel = new Referral();
      this.visibleModal = true;
      this.createReferralForm();
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  resetVoucherEdit() {
    try {
      this.modelSvc.prepareVoucherDetails(this.modelSvc.tempVoucher);
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  print() {
    try {
     
          let reportData = this.prepareVoucherOption(this.listVoucher,this.reportRenderingType.PDF);
          this.reportSvc.printReport(reportData,false);
       
    } catch (e) {
      throw e;
    }
  }
  private prepareVoucherOption(data: any[],type) {
    try {
      let title = null;
      if (data.length > 0) title = data[0].title;
      
      return {
        reportName: 'DemoReport',
        reportType: type,
        userID: 1,
        data: this.modelSvc.prepareDateForPrint(data),
        params: this.getRptParameter(),
        dataSetName: "sp_GetVoucherApprovalList",
      };
    } catch (e) {
      throw e;
    }
  }

  getRptParameter() {
    try {
      var params = [
        {
          key: "Title",
          value: "Voucher Approval List",
        }  ,
        {
          key: "Company",
          value: "Sonali Life Insurance Ltd.",
        }       
      ];
      return params;
    } catch (e) {
      throw e;
    }
  }
}