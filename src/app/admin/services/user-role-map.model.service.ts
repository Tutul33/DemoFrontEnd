import { Injectable } from '@angular/core';
import { UserRoleMap } from '../models/UserRoleMap.model';
import { GlobalMethods } from '../../shared/models/javascriptMethods';

@Injectable({
  providedIn: 'root'
})
export class UserRoleMapModelService {
  isCheckAll: boolean = false;
  userRoleMapModelList:UserRoleMap[]=[];
  selectedUserNames:any[]=[];
  ddlUserNames:any[]=[];
  selectedEmpNames:any[]=[];
  ddlEmpNames:any[]=[];
  selectedRoleNames:any[]=[];
  ddlRoleNames:any[]=[];

  //Filter
  filterUserNames: string[] = [];
  filterEmpNames: string[] = [];
  filterRoleNames: string[] = [];
  prepareUserMapList(data){
    try {
      this.userRoleMapModelList=data;
      this.ddlEmpNames=GlobalMethods.getDistinctBy(this.userRoleMapModelList,'empName');
      this.ddlRoleNames=GlobalMethods.getDistinctBy(this.userRoleMapModelList,'roleName');
      this.ddlUserNames=GlobalMethods.getDistinctBy(this.userRoleMapModelList,'userName');
      setTimeout(() => {
        this.setCheckAll();
      }, 0);
    } catch (error) {
      throw error;
    }
  }
  
  setCheckAll(){
    try {
      const totalActiveList=this.userRoleMapModelList.filter(x=>x.isActive==true);
      if((this.userRoleMapModelList.length>0)&& (this.userRoleMapModelList.length==totalActiveList.length)){
         this.isCheckAll=true;
      }else{
         this.isCheckAll=false;
      }
    } catch (error) {
      throw error;
    }
  }

  checkAll(){
    try {
      if (this.isCheckAll) {
        this.userRoleMapModelList.forEach((item)=>{
        item.isActive=true;
      });
      } else {
        this.userRoleMapModelList.forEach((item)=>{
        item.isActive=false;
      });
      }        
    } catch (error) {
      throw error;
    }
  }

  prepareDataBeforeSave(){
    try {
      
      this.userRoleMapModelList.forEach((item)=>{
        if(item.userRoleMapId){
          item.setModifyTag();
        }else{
          item.setInsertTag();
        }
      })
      return this.userRoleMapModelList;

    } catch (error) {
      throw error;
    }
  }

}
