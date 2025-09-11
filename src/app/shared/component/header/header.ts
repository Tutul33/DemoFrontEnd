import { Component } from '@angular/core';
import { Authsvc } from '../../services/authsvc';
import { Router } from '@angular/router';
import { SidebartoggleDataService } from '../../services/sidebartoggle.data.service';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../store/auth.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  loggedUser$: Observable<any | null>;
  loggedBy:string='';
  constructor(private authService:Authsvc,private router:Router,public sidebar:SidebartoggleDataService,private store: Store){
    this.loggedUser$ = this.store.select(selectCurrentUser);
  }
  
  ngOnInit(){
     this.loggedUser$.subscribe(user => {
      if (user) {
        this.loggedBy = user.userName;
        
      }
    });
  }

  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebar.toggleCollapsed();
  }
  
}
