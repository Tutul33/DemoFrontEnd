import { Component } from '@angular/core';
import { SidebartoggleDataService } from '../../services/sidebartoggle.data.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth.selectors';

@Component({
  selector: 'app-sidebar',
  imports: [AsyncPipe, CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  animations: [
    trigger('expandCollapse', [
      state('expanded', style({ height: '*', opacity: 1, padding: '0.5rem 0' })),
      state('collapsed', style({ height: '0px', opacity: 0, padding: '0 0' })),
      transition('expanded <=> collapsed', [animate('300ms ease-in-out')])
    ])
  ]
})
export class Sidebar {
  loggedUser$: Observable<any | null>;
  menuItems: any[] = [];
  openMenuIndex: number | null = null;
  activeChildRoute: any = null;

  constructor(
    public sidebarCollapse: SidebartoggleDataService,
    private router: Router,
    private store: Store,
  ) {
    this.loggedUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.prepareMenu();
    // Subscribe to menuItems from service
    this.sidebarCollapse.menuItems$.subscribe(items => {
      this.menuItems = items;
      this.updateActiveMenu();
    });

    // Subscribe to route changes
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateActiveMenu());
  }

  prepareMenu(){
    try {
      this.loggedUser$.subscribe(user => {
      if (user) {
        this.sidebarCollapse.updateMenuItems(user);
      }
    });
      // const userInfo=this.authSvc.getLoggedUserInfo();
      // if(userInfo){
      //   this.sidebarCollapse.updateMenuItems(userInfo);
      // }
    } catch (error) {
      
    }
  }

  updateActiveMenu() {
    const currentUrl = this.router.url.split('?')[0];
    const queryParams = this.router.parseUrl(this.router.url).queryParams;

    this.openMenuIndex = null;
    this.activeChildRoute = null;

    this.menuItems.forEach((item, i) => {
      if (this.isRouteActive(item, currentUrl, queryParams)) {
        if (item.children?.length) {
          this.openMenuIndex = i;
          const activeChild = item.children.find(
            (child: any) => currentUrl === child.route && this.isQueryParamMatch(child.queryParam, queryParams)
          );
          this.activeChildRoute = activeChild || null;
        } else {
          this.openMenuIndex = null;
          this.activeChildRoute = item;
        }
      }
    });
  }

  isRouteActive(item: any, currentUrl: string, queryParams: any): boolean {
    if (currentUrl === item.route && this.isQueryParamMatch(item.queryParam, queryParams)) return true;
    return item.children?.some((child: any) => currentUrl === child.route && this.isQueryParamMatch(child.queryParam, queryParams));
  }

  isQueryParamMatch(expected: any, actual: any): boolean {
    if (!expected) return true;
    return Object.keys(expected).every(key => expected[key] === actual[key]);
  }

  toggleMenu(index: number) {
    this.openMenuIndex = this.openMenuIndex === index ? null : index;
  }

  routeToPage(routeObj: any) {
    if (!routeObj.queryParam) {
      this.router.navigate([routeObj.route]);
    } else {
      this.router.navigate([routeObj.route], { queryParams: routeObj.queryParam });
    }
  }
}
