import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { oauthString, cookieValidationTimeLeft } from '../../../misc/utils.js';
import { StravaService } from '../../../services/strava.service';

@Component({
  selector: 'app-home',
  template: `
    <div class="home">
      <div *ngIf="!fetching" (click)="clickHandler()" class="strava-icon">
        <div><img class="strava-svg" src="/assets/strava.svg" /></div>
        <div>{{ stravaButtonTitle }}</div>
      </div>
      <mat-spinner *ngIf="fetching"></mat-spinner>
    </div>
  `,
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  oauthString: string = oauthString();
  stravaButtonTitle: string = 'Connect';
  metricsFetched: boolean = false;
  fetching: boolean;
  constructor(private router: Router, private stravaService: StravaService) {}

  ngOnInit() {
    this.stravaService.isCookieValid.subscribe(bool => {
      this.stravaButtonTitle = bool ? 'Fetch metrics' : 'Connect';
    });
    this.stravaService.isFetchingActivities.subscribe(bool => {
      this.fetching = bool;
    });
    this.stravaService.metrics.subscribe(metrics => {
      this.stravaButtonTitle = metrics.length > 0 ? 'Show metrics' : this.stravaButtonTitle;
    });
  }

  clickHandler() {
    if (this.stravaButtonTitle === 'Show metrics') {
      this.router.navigate(['/dashboard']);
    } else if (this.stravaButtonTitle === 'Connect') {
      document.location = oauthString();
    } else {
      if (!cookieValidationTimeLeft()) {
        this.stravaService.invalidateCookie();
      } else {
        this.stravaService.fetchStravaActivities().then((metrics: string[]) => {
          if (metrics.length) {
            this.router.navigate(['/dashboard']);
          }
        });
      }
    }
  }
}
