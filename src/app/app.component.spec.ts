import { DebugElement } from '@angular/core';
import { TestBed, async, fakeAsync, ComponentFixture, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { Router } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { HomeComponent } from './components/pages/home/home.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { routes } from './app-routing.module';
import { StravaService } from './services/strava.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let location: Location;
  let router: Router;
  let el: DebugElement;
  let comp: AppComponent;
  let mockStravaService: MockStravaService;

  class MockStravaService {
    constructor() {}
    getAccessToken() {}
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule.withRoutes(routes), MatTabsModule, MatProgressSpinnerModule],
      declarations: [AppComponent, HeaderComponent, HomeComponent, DashboardComponent],
    }).compileComponents();
    mockStravaService = new MockStravaService();
    TestBed.overrideProvider(StravaService, { useValue: mockStravaService });
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
  }));

  it('calls getAccessToken with ?code parameters and redirects to / after getting access token', fakeAsync(() => {
    spyOn(mockStravaService, 'getAccessToken');
    fixture.ngZone.run(() => {
      router.initialNavigation();
      router.navigateByUrl('?code=12345');
      tick(); /* navigation is async in angular! */
      comp.ngOnInit();
      expect(mockStravaService.getAccessToken).toHaveBeenCalledTimes(1);
      expect(mockStravaService.getAccessToken).toHaveBeenCalledWith('12345');
      tick(); /* getAccessToken is async */
      expect(location.path()).toBe('/');
    });
  }));
});
