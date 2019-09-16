import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { StravaService } from './services/strava.service';

import { cookieValidationTimeLeft } from './misc/utils.js';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <app-header></app-header>
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, private stravaService: StravaService) {}
  ngOnInit() {
    /* OAUTH will redirect us to our website with ?code querystring, which we need to get access token */
    this.activatedRoute.queryParams.subscribe(async params => {
      if (params.code) {
        await this.stravaService.getAccessToken(params.code);
        this.router.navigate(['']);
      }
    });
    if (cookieValidationTimeLeft() > 0) {
      this.stravaService.orderCookieRefreshing();
    }
  }
}
