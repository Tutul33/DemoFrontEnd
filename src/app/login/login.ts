import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Authsvc } from '../shared/services/authsvc';
import { LoginDataService } from '../shared/services/login.data.service';
import { CommonModule } from '@angular/common';
import { SidebartoggleDataService } from '../shared/services/sidebartoggle.data.service';
import { InformationService } from '../shared/services/information-service';
import { LoadingService } from '../shared/services/loading-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DividerModule,
    InputTextModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: Authsvc,
    private dataSvc: LoginDataService,
    private sidebar: SidebartoggleDataService,
    private msgSvc: InformationService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;
    this.loadingService.show();
    setTimeout(() => {
      const { userName, password } = this.loginForm.value;

      this.dataSvc.login(userName, password).subscribe({
        next: (response: any) => {
          const res=response.data;
          if (res) {            
            this.authService.login(res.userInfo, res.token);
            localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
            localStorage.setItem('isCollapsed', 'true');
            localStorage.setItem('access_token', res.token);
            this.sidebar.toggleCollapsed();            
            //this.sidebar.updateMenuItems(res.userInfo);
            this.authService.startAutoLogoutWatcher();
            this.loadingService.hide();
            this.router.navigate(['/dashboard']);
            this.msgSvc.showSuccessMsg('Loggedin Successfully.');
          }
        },
        error: (err) => {
          this.loadingService.hide();
          this.msgSvc.showWarningMsg('Loggedin failed.Please provide vaild username and password.');
          console.error('Login failed', err);
        }
      });
    }, 500);
  }
}
