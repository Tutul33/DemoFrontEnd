import { TreeNode } from "primeng/api";

export class Voucher {
    id: number = 0;
    entryDate: Date = null;
    voucherNo: string = null;
    voucherType: string = null;
    voucherSrc: string = null;
    voucherBranch: number = null;
    chkNo: string = null;
    chkDt: Date = null;
    accStatement: string = null;
    voucherItems: VoucherItem[] = [];
    totalDebit: number = 0;
    totalCredit: number = 0;
    outOfBalance: number = 0;
    constructor(defaultData?: Partial<Voucher>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export class VoucherItem {
  id: number = 0;
  voucherNo: string = null;
  codeAndName: string = null;
  actCode: string = null;
  actName: string = null;
  fromActCode: string = null;
  toActCode: string = null;
  dAmount: number = null;
  cAmount: number = null;
  amt: number = null;
  accStatement: string = null;
  descrp: string = null;
  modOfPay: string = null;
  chkNo: string = null;
  chkDt: Date = null;
  openingBalance: number = null;
  shopId: number = null;
  userId: string = null;
  entryDate: Date = null;
  delDate: Date = null;
  delUser: string = null;
  mainCode: string = null;
  subGroupCat: string = null;
  transfered: boolean = null;
  createDate: Date = null;
  checkedBy: string = null;
  approvedBy: string = null;
  authStatus: string = null;
  checkedDate: Date = null;
  approvedDate: Date = null;

  // extra properties from your example
  tag: number = 0;
  chartOfAccountList: TreeNode[] = [];
  subLedgerList: any[] = [];
  node: any = null;
  subLedgerNode: any = null;
  updateType:string="";
  constructor(defaultData?: Partial<VoucherItem>) {
    if (defaultData) {
      Object.keys(defaultData).forEach(key => {
        if (this.hasOwnProperty(key)) {
          this[key] = defaultData[key];
        }
      });
    }
  }
}