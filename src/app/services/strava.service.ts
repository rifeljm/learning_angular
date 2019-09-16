import { Injectable } from '@angular/core';
import {
  cookieValidationTimeLeft,
  setCookies,
  getCookie,
  oauthEndpoint,
  stravaApiEndpoint,
  getAccessTokenSecrets,
  refreshAccessTokenSecrets,
  reduceActivitiesToMetrics,
} from '../misc/utils.js';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StravaService {
  constructor(private http: HttpClient, private router: Router) {}
  private _metrics = new BehaviorSubject<string[]>([]);
  private _isCookieValid = new BehaviorSubject<boolean>(cookieValidationTimeLeft() > 0);
  private _isFetchingActivities = new BehaviorSubject<boolean>(false);
  readonly metrics = this._metrics.asObservable();
  readonly isCookieValid = this._isCookieValid.asObservable();
  readonly isFetchingActivities = this._isFetchingActivities.asObservable();

  getAccessToken(code: string) {
    return new Promise(resolve => {
      this.http.post(`${oauthEndpoint}token`, { ...getAccessTokenSecrets, code }).subscribe(accessTokenData => {
        setCookies(accessTokenData);
        this._isCookieValid.next(true);
        this.orderCookieRefreshing();
        resolve();
      });
    });
  }

  invalidateCookie() {
    this._isCookieValid.next(false);
  }

  fetchStravaActivities() {
    this._isFetchingActivities.next(true);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json',
        Authorization: `Bearer ${getCookie('access_token')}`,
      }),
    };
    return new Promise(resolve => {
      return this.http.get(`${stravaApiEndpoint}athlete/activities`, httpOptions).subscribe(activities => {
        const metrics = reduceActivitiesToMetrics(activities);
        this._metrics.next(metrics);
        this._isFetchingActivities.next(false);
        resolve(metrics);
      });
    });
  }

  refreshToken() {
    this.http.post(`${oauthEndpoint}token`, refreshAccessTokenSecrets).subscribe(accessTokenData => {
      setCookies(accessTokenData);
      this._isCookieValid.next(true);
    });
  }

  orderCookieRefreshing() {
    /* do we have cookie and is it still valid? */
    setTimeout(() => {
      this.refreshToken();
      setInterval(() => {
        this.refreshToken();
      }, 4 * 3600 * 1000); /* 4 hours */
    }, cookieValidationTimeLeft() - 10 * 60 * 1000); /* refresh token at least 10 minutes before expiration */
  }
}
