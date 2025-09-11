import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InformationService } from '../../shared/services/information-service';
import { GlobalMethods } from '../../shared/models/javascriptMethods';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../shared/store/auth.selectors';

@Component({
  selector: 'app-home',
  imports: [SelectModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  loggedUser$: Observable<any | null>;
  selectedYear: any;
  years: any[] = [];
  items: any[] = [
    {
      label: 'check-pending',
      title: 'Check Pending',
      hasAccess: false,
    },
    {
      label: 'approval-pending',
      title: 'Approval Pending',
      hasAccess: false,
    },
    {
      label: 'referral-pending',
      title: 'Referral Pending',
      hasAccess: false,
    }
  ];
  constructor(private router: Router, private msgSvc: InformationService, private store: Store,) {
    this.loggedUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit() {
    this.prepareYears();
    this.prepareAccess();
  }

  prepareAccess() {
    try {
      this.loggedUser$.subscribe(userInfo => {
      if (userInfo) {
         if (userInfo.payRoleName == GlobalMethods.roleAdmin) {
          this.items.forEach((item) => {
            item.hasAccess = true;
          });
        } else {
          if (userInfo.roleList?.length) {
            const roleList = userInfo.roleList;
            this.items.forEach((item) => {
              item.hasAccess = roleList.find(x => item.title.includes(x.roleName)) ? true : false;
            });
          }
        }
      }
    });
      // const userInfo = this.authSvc.getLoggedUserInfo();
      // if (userInfo) {
      //   if (userInfo.payRoleName == GlobalMethods.roleAdmin) {
      //     this.items.forEach((item) => {
      //       item.hasAccess = true;
      //     });
      //   } else {
      //     if (userInfo.roleList?.length) {
      //       const roleList = userInfo.roleList;
      //       this.items.forEach((item) => {
      //         item.hasAccess = roleList.find(x => item.title.includes(x.roleName)) ? true : false;
      //       });
      //     }
      //   }
      // }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  prepareYears() {
    try {
      const currentYear = new Date().getFullYear();

      this.selectedYear = { year: currentYear };

      for (let i = 0; i <= 5; i++) {
        this.years.push({ year: currentYear - i });
      }
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }

  routesToPage(status: string) {
    try {
      this.router.navigate(['/accounting/voucher-approval'], {
        queryParams: { status: status,year:this.selectedYear.year }
      });
    } catch (error) {
      this.msgSvc.showErrorMsg(error);
    }
  }
}
