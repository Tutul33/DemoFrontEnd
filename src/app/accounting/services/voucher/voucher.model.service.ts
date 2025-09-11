import { Injectable } from '@angular/core';
import { Voucher, VoucherItem } from '../../models/voucher.model';
import { Referral } from '../../models/Referral.model';
import { TreeNode } from 'primeng/api';
import { EntityState, GlobalMethods } from '../../../shared/models/javascriptMethods';
@Injectable({
  providedIn: 'root'
})
export class VoucherModelService {
  voucherModel: Voucher = new Voucher();
  status: any = '';
  year: any = '';
  loggedBy: string = '';
  listFinanceBankingUser: any[] = [];
  selectedSubLedgers: any[] = [];
  selectedUser: any;
  referralModel: Referral = new Referral();
  allChartOfAccountsList: any[] = [];
  chartOfAccounts: TreeNode[];
  node: any;
  subLedgerNode: any;
  tempVoucher: any;
  voucherTypes: any[] = [
    { id: 1, name: 'Bank' },
    { id: 2, name: 'Cash' },
    { id: 3, name: 'Contra' },
    { id: 4, name: 'JV' },
    { id: 4, name: 'Claim' }
  ];
  voucherItem: VoucherItem = new VoucherItem();
  subLedgerList: any[] = [];
  referralList:Referral[]=[];
  constructor(){
    
  }

  getDistinctUserIds(data: any[]): any {
    const seen = new Set<string>();
    const result: { userId: string }[] = [];

    for (const item of data) {
      if (item.userId && !seen.has(item.userId)) {
        seen.add(item.userId);
        result.push({ userId: item.userId });
      }
    }

    return result;
  }

  getDistinctVoucherNos(data: any[]): any {
    try {
      const seen = new Set<string>();
      const result: { voucherNo: string }[] = [];

      for (const item of data) {
        if (item.userId && !seen.has(item.voucherNo)) {
          seen.add(item.voucherNo);
          result.push({ voucherNo: item.voucherNo });
        }
      }

      return result;
    } catch (error) {
      return error;
    }
  }

  prepareVoucherDetails(data: any) {
    try {
      this.tempVoucher = GlobalMethods.deepClone(data);
      this.voucherModel = new Voucher(data[0]);
      data.forEach((item) => {
        let voucherItem = new VoucherItem(item);
        this.prepareVoucherItemData(voucherItem);
        voucherItem.setModifyTag();
        this.voucherModel.voucherItems.push(voucherItem);
      });
      this.voucherModel.entryDate = new Date(data[0].entryDate)
      if ((data[0].chkDt))
        this.voucherModel.chkDt = new Date(data[0].chkDt)
      this.voucherModel.totalDebit = this.voucherModel.voucherItems.reduce((acc, i) => { return acc + i.dAmount }, 0);
      this.voucherModel.totalCredit = this.voucherModel.voucherItems.reduce((acc, i) => { return acc + i.cAmount }, 0);
      this.voucherModel.outOfBalance = this.voucherModel.totalDebit - this.voucherModel.totalCredit;

      this.voucherItem.chartOfAccountList = GlobalMethods.deepClone(this.chartOfAccounts);
    } catch (error) {
      return error;
    }
  }

  private prepareVoucherItemData(voucherItem: VoucherItem) {
    voucherItem.chartOfAccountList = GlobalMethods.deepClone(this.chartOfAccounts);
    const existInLedger = this.allChartOfAccountsList.find(x => x.key == voucherItem.actCode && x.accLevel < 5);
    if (existInLedger) {
      voucherItem.node = GlobalMethods.findTreeNodeByKey(voucherItem.chartOfAccountList, voucherItem.actCode);
    } else {
      const existInSubLedger = this.allChartOfAccountsList.find(x => x.key == voucherItem.actCode && x.accLevel == 5);
      if (existInSubLedger) {
        const parent = this.allChartOfAccountsList.find(x => x.key == existInSubLedger.parent && x.accLevel < 5);
        if (parent) {
          voucherItem.node = GlobalMethods.findTreeNodeByKey(voucherItem.chartOfAccountList, parent.key);
        }

        const subLdgList = this.allChartOfAccountsList.filter(x => x.parent == existInSubLedger.parent);
        if (subLdgList) {

          const sudLedger = subLdgList.find(x => x.key == voucherItem.actCode);
          if (sudLedger) {
            voucherItem.subLedgerNode = sudLedger.key;
            voucherItem.subLedgerList = subLdgList;
          }
        }
      }
    }
  }

  prepareTreeData(arr, parent) {
    try {
      const master: any[] = [];
      let level = 1;
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        val.expandLevel = level;
        val.label = val.label;
        val.accLevel = val.accLevel;
        if (val.parent == parent) {
          const children = this.prepareTreeData(arr, val.key);
          if (children.length) {
            val.children = children;
          }
          level++;
          master.push(val);
        }

      }
      return master;
    } catch (error) {
      throw error;
    }
  }

  prepareBeforeSave() {
    try {
      let data = [];
      if (this.status == 'check-pending' || this.status == 'approval-pending') {
        this.voucherModel.voucherItems.forEach((item) => {
          data.push({
            id: item.id,
            checkedBy: this.status == 'check-pending' ? this.loggedBy : '',
            approvedBy: this.status == 'approval-pending' ? this.loggedBy : ''
          });
        });
      } if (this.status == 'referral-pending') {
        const cleanedVoucherItems = this.voucherModel.voucherItems.map(({
          chartOfAccountList,
          subLedgerList,
          node,
          subLedgerNode,
          updateType,
          ...rest
        }) => ({
          ...rest,
          updateType: this.status
        }));

        const commonData = cleanedVoucherItems[0];

        cleanedVoucherItems.forEach((item: VoucherItem) => {
          let voucherItem = new VoucherItem(item);
          if (item.tag == EntityState.Added) {
            this.setCommonValueNewRow(commonData, voucherItem);
          } else if (item.tag == EntityState.Modified) {
            voucherItem.checkedBy=null;
            voucherItem.checkedDate=null;
            voucherItem.approvedBy=null;
            voucherItem.approvedDate=null;
          }
          else if (item.tag == EntityState.Deleted) {
             voucherItem.delUser = this.loggedBy;
          }
          data.push(voucherItem);
        });

      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  setCommonValueNewRow(commonData: any, voucherItem: VoucherItem) {
    try {
      voucherItem.voucherNo = commonData.voucherNo;
      voucherItem.accStatement = commonData.accStatement;
      voucherItem.chkNo = commonData.chkNo;
      voucherItem.chkDt = commonData.chkDt;
      voucherItem.openingBalance = commonData.openingBalance;
      voucherItem.shopId = commonData.shopId;
      voucherItem.userId = commonData.userId;
      voucherItem.entryDate = commonData.entryDate;
      voucherItem.delDate = commonData.delDate;
      voucherItem.delUser = commonData.delUser;
      voucherItem.mainCode = commonData.mainCode;
      voucherItem.subGroupCat = commonData.subGroupCat;
      voucherItem.transfered = commonData.transfered;
      voucherItem.createDate = commonData.createDate;
      voucherItem.checkedBy = commonData.checkedBy;
      voucherItem.approvedBy = commonData.approvedBy;
      voucherItem.authStatus = commonData.authStatus;
      voucherItem.checkedDate = commonData.checkedDate;
      voucherItem.approvedDate = commonData.approvedDate;
      voucherItem.amt = commonData.cAmount+commonData.dAmount;

    } catch (error) {
      throw error;
    }
  }

  prepareReferDataBeforeSave(data) {
    try {
      this.referralModel = new Referral(data);
      this.referralModel.id = 0;
      this.referralModel.refBy = this.loggedBy;
      this.referralModel.voucherNo = this.voucherModel.voucherNo;
      this.referralModel.refType = this.status;

      return this.referralModel;
    } catch (error) {
      throw error;
    }
  }

  addNewVoucherItem(voucherItem) {
    try {
      this.prepareVoucherItemData(voucherItem);

      this.voucherModel.voucherItems = this.voucherModel.voucherItems.entityPush(voucherItem);
    } catch (error) {
      throw error;
    }
  }

  removeVoucherItem(voucherItem) {
    try {
      if (voucherItem.tag == 4) {
        this.voucherModel.voucherItems = this.voucherModel.voucherItems.entityPop(voucherItem);
      } else {
        voucherItem.setDeleteTag();
      }
    } catch (error) {
      throw error;
    }
  }

  prepareBaseChartAccounts(data) {
    try {
      this.allChartOfAccountsList = GlobalMethods.deepClone(data);
      const baseChartOfAccounts = data.filter((x) => Number(x.accLevel) < 5);
      if (baseChartOfAccounts.length) {
        this.chartOfAccounts = this.prepareTreeData(baseChartOfAccounts, '');
      }

      const subLedgerList = data.filter((x) => Number(x.accLevel) == 5);
      if (subLedgerList.length) {
        this.subLedgerList = subLedgerList;
      }
    } catch (error) {
      throw error;
    }
  }

  getSubLedgerOnSelect(voucherItem) {
    try {
      voucherItem.subLedgerNode=null;
      this.setVoucherData(voucherItem);
      const subLedgerList = this.subLedgerList.filter((x) => x.parent == voucherItem.node.key);
      voucherItem.subLedgerList = subLedgerList.length > 0 ? subLedgerList : [];
      console.log('Voucher Item:', this.voucherItem)
    } catch (error) {
      throw error;
    }
  }

  setVoucherData(voucherItem) {
    try {
      voucherItem.codeAndName = voucherItem.node.label + '-' + voucherItem.node.key;
      voucherItem.actCode = voucherItem.node.key;
      voucherItem.actName = voucherItem.node.label;
    } catch (error) {
      throw error;
    }
  }

  setVoucherDataOnSubLedgerChange(voucherItem) {
    try {debugger
      const filterData=this.subLedgerList.find(x=>x.key==voucherItem.subLedgerNode);
      if(filterData){
      voucherItem.codeAndName = filterData.label + '-' + filterData.key;
      voucherItem.actCode = filterData.key;
      voucherItem.actName = filterData.label;
      }else{
        this.setVoucherData(voucherItem);
      }
    } catch (error) {
      throw error;
    }
  }

  getSubLedgerOnSelectAdd(ledger) {
    try {
      this.setVoucherDataAdd(ledger);
      const subLedgerList = this.subLedgerList.filter((x) => x.parent == ledger.node.key);
      this.voucherItem.subLedgerList = subLedgerList.length > 0 ? subLedgerList : [];
      console.log('Voucher Item:', this.voucherItem)
    } catch (error) {
      throw error;
    }
  }

  setVoucherDataAdd(ledger) {
    try {

      this.voucherItem.codeAndName = ledger.node.label + '-' + ledger.node.key;
      this.voucherItem.actCode = ledger.node.key;
      this.voucherItem.actName = ledger.node.label;
    } catch (error) {
      throw error;
    }
  }

  setVoucherDataAddSubLedger(ledger) {
    try {

      this.voucherItem.codeAndName = ledger.label
      this.voucherItem.actCode = ledger.key;
      this.voucherItem.actName = ledger.label;
    } catch (error) {
      throw error;
    }
  }

  prepareReferralData(referralList){
    try {
      this.referralList=referralList;
    } catch (error) {
      throw error;
    }
  }

prepareSortData(sortObj, list) {
  if (!sortObj?.sortField) return [...list];

  return [...list].sort((a, b) => {
    let valueA = a[sortObj.sortField];
    let valueB = b[sortObj.sortField];

    if (valueA == null) return 1;
    if (valueB == null) return -1;

    const isDateA = valueA instanceof Date || !isNaN(Date.parse(valueA));
    const isDateB = valueB instanceof Date || !isNaN(Date.parse(valueB));

    if (isDateA && isDateB) {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortObj.sortOrder === 1 ? valueA - valueB : valueB - valueA;
    }

    valueA = valueA.toString().toLowerCase();
    valueB = valueB.toString().toLowerCase();

    if (valueA < valueB) return sortObj.sortOrder === 1 ? -1 : 1;
    if (valueA > valueB) return sortObj.sortOrder === 1 ? 1 : -1;
    return 0;
  });
}

prepareDateForPrint(data){
  try {
    return data.map((item)=>({
      voucherNo:item.voucherNo,
      amt:item.amt,
      entryDate:item.entryDate,
      userId:item.userId,
      createDate:item.createDate
    }));
  } catch (error) {
    throw error;
  }
}

}
