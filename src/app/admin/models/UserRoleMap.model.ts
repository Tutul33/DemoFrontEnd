export class UserRoleMap {
    id: number = 0;
    userId: number = 0;
    roleId: number = 0;
    isActive: boolean = false;

    //Extra
    userRoleMapId:number=0;
    userName:string="";
    empId:number=0;
    empName:string="";
    roleName:string="";
    constructor(defaultData?: Partial<UserRoleMap>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}