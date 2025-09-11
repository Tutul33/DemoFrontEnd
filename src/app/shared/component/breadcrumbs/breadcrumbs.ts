import { Component } from '@angular/core';
import { Breadcrumb } from '../../models/breadcrumb';
import { BreadcrumbService } from '../../services/breadcrumbs.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Divider } from "primeng/divider";

@Component({
  selector: 'app-breadcrumbs',
  imports: [CommonModule, FormsModule, RouterModule, Divider],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.css'
})
export class Breadcrumbs {
breadcrumbs: Breadcrumb[] = [];

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadcrumbService.breadcrumbs;

    // Optional: subscribe if you want reactive updates
    this.breadcrumbService.router.events.subscribe(() => {
      this.breadcrumbs = this.breadcrumbService.breadcrumbs;
    });
  }
}
