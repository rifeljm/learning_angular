import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <nav mat-tab-nav-bar>
      <a
        mat-tab-link
        *ngFor="let link of navLinks"
        [routerLinkActiveOptions]="{ exact: true }"
        [routerLink]="link.path"
        routerLinkActive
        #rla="routerLinkActive"
        [active]="rla.isActive"
      >
        {{ link.label }}
      </a>
    </nav>
  `,
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  constructor() {}
  navLinks: { path: string; label: string }[] = [
    {
      path: '/',
      label: 'Home',
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
    },
  ];

  ngOnInit() {}
}
