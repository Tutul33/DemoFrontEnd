import { Injectable } from '@angular/core';
import { Demo, DemoItem, DemoItemFileAttachment } from '../models/demo-model';

@Injectable({
  providedIn: 'root'
})
export class DemoModelService {

  demoList: any[] = [];

  prepareDemoList(data) {
    try {
      this.demoList = data;
    } catch (error) {
      throw error;
    }
  }

  prepareDataBeforeSave(data) {
    try {
      let demoObj = new Demo(data);
      demoObj.demoItems.forEach((item) => {
        item = new DemoItem(item);
        item.setInsertTag();
        item.demoItemFileAttachments.forEach((attachment) => {
          attachment = new DemoItemFileAttachment(attachment);
          attachment.setInsertTag();
        });
      })
      return demoObj;
    } catch (error) {
      throw error;
    }
  }

  prepareDataOnDelete(data) {
    try {
      this.demoList = this.demoList.filter(x => x.id != data.id);
    } catch (error) {
      throw error;
    }
  }

  prepareDateForPrint(data) {
    try {
      return data.map(item => ({ id: item.id, name: item.name }));
    } catch (error) {
      throw error;
    }
  }

}
