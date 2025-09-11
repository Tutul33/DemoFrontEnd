export class Referral {
    id: number = 0;
    referralId: number = 0;
    voucherNo: string = null;
    refBy: string = null;
    refTo: string = null;
    refType: string = null;
    comments: string = null;
    referDate: Date = null;
    IsActive: boolean = false;
    constructor(defaultData?: Partial<Referral>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}