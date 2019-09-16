import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { StravaService } from '../../../services/strava.service';

const titles = ['This year', 'Last month', 'This month', 'Avg. speed last month', 'Avg. speed this month'];

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="content">
      <div class="metric" *ngFor="let metric of metrics">
        <div>
          <div class="metric__value">{{ metric.value }}</div>
          <div class="metric__title">{{ metric.title }}</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  metrics: { value: string; title: string }[];
  constructor(private stravaService: StravaService, private router: Router) {}

  ngOnInit() {
    this.stravaService.metrics.subscribe(metrics => {
      if (!metrics.length) {
        this.router.navigate(['/']);
      }
      this.metrics = metrics.map((metric, idx) => {
        return {
          value: metric,
          title: titles[idx],
        };
      });
    });
  }
}
