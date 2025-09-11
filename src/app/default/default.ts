import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Header } from '../shared/component/header/header';
import { Authsvc } from '../shared/services/authsvc';
import { Sidebar } from '../shared/component/sidebar/sidebar';
import { Footer } from "../shared/component/footer/footer";
import { SidebartoggleDataService } from '../shared/services/sidebartoggle.data.service';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn } from '../shared/store/auth.selectors';
import { logout } from '../shared/store/auth.actions';
import { Breadcrumbs } from '../shared/component/breadcrumbs/breadcrumbs';
import { Chat } from '../shared/component/chat/chat';

@Component({
  selector: 'app-default',
  imports: [CommonModule, Sidebar, Header, RouterOutlet, AsyncPipe, Footer,Breadcrumbs,Chat],
  templateUrl: './default.html',
  styleUrl: './default.css'
})
export class Default {
  isLoggedIn$!: Observable<boolean>;
  sidebarCollapsed = true;
  constructor(public auth:Authsvc,private router:Router,public sidebarCollapse: SidebartoggleDataService, private store: Store){

  }
  
  ngOnInit(){
    this.sidebarCollapsed=false;
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);
  }
 toggleSidebar(){
  this.sidebarCollapsed=!this.sidebarCollapsed;
 }
  logout() {
  this.store.dispatch(logout());
  this.router.navigate(['/login']);
  }
}
