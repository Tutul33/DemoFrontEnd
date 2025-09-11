export class Demo {
    id: number = null;
    name: string = null;
    isActive: boolean = false;
    createDate: Date = null;
    demoItems: DemoItem[]=[];
    constructor(defaultData?: Partial<Demo>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export class DemoItem {
    id: number = null;
    demoId: number = null;
    name: string = null;
    description: string = null;
    title: string = null;
    isActive: string = null;
    demoItemFileAttachments: DemoItemFileAttachment[]=[];

    //extra
    tag:number=0;
    constructor(defaultData?: Partial<DemoItem>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}

export class DemoItemFileAttachment {
    id: number = null;
    demoItemId: number = null;
    fileName: string = null;
    prvFileName: string = null;
    folderNAme: string = null;
    isActive: boolean = false;

    //Extra
    tag:number=0;
    previewUrl:any;
    selectedFile:any;
    constructor(defaultData?: Partial<DemoItemFileAttachment>) {
        defaultData = defaultData || {};
        Object.keys(defaultData).forEach((key) => {
            const value = defaultData[key];
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        });
    }
}
