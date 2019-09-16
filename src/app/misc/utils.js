import cookie from 'cookie';

export const oauthEndpoint = 'https://www.strava.com/oauth/';
export const stravaApiEndpoint = 'https://www.strava.com/api/v3/';

const STRAVA_CLIENT_ID = '38676';
const STRAVA_REDIRECT_URI = 'http://localhost:4200';
const STRAVA_CLIENT_SECRET = '1a569e10a00c04768d297345aa5c4957f6a2cc02';

export function setCookies(data) {
  document.cookie = `strava=${[data.access_token, data.refresh_token, data.expires_at].join('|')}; expires=-999999999`;
}

/**
 * Returns previous month's first day
 * @return {Date} [description]
 */
export function lastMonth() {
  let d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d;
}

export function getCookies() {
  return cookie.parse(document.cookie) || {};
}

/**
 * Only four possible cookies are valid to be parsed from document.cookie
 * @return {string} value of cookie
 */
export function getCookie(type) {
  const stravaTokens = getCookies().strava;
  if (!stravaTokens) {
    return null;
  }
  const keys = ['access_token', 'refresh_token', 'expires'];
  const tokenArray = stravaTokens.split('|');
  if (tokenArray.length !== 3) {
    return null;
  }
  const obj = keys.reduce((prev, key, idx) => {
    return { ...prev, [key]: tokenArray[idx] };
  }, {});
  return obj[type];
}

function monthISO(date) {
  return new Date(date).toISOString().substring(0, 7);
}

function lastMonthActivities(activities) {
  return activities.filter(x => {
    return monthISO(new Date(x.start_date)) === monthISO(lastMonth());
  });
}
function thisMonthActivities(activities) {
  return activities.filter(x => {
    return monthISO(new Date(x.start_date)) === monthISO(new Date());
  });
}

/**
 * all distances will be shown with the maximum of 1 decimal
 */
function mToKm(m) {
  return parseInt(m / 100, 10) / 10;
}

export function reduceActivitiesToMetrics(activities) {
  const thisYearDistance = activities.reduce((prev, activity) => {
    return prev + activity.distance;
  }, 0);
  const lastMonthDistance = lastMonthActivities(activities).reduce((prev, activity) => {
    return prev + activity.distance;
  }, 0);
  const thisMonthDistance = thisMonthActivities(activities).reduce((prev, activity) => {
    return prev + activity.distance;
  }, 0);
  const lastMonthTime = lastMonthActivities(activities).reduce((prev, activity) => {
    return prev + activity.elapsed_time;
  }, 0);
  const thisMonthTime = thisMonthActivities(activities).reduce((prev, activity) => {
    return prev + activity.elapsed_time;
  }, 0);

  const avgSpeedLastMonth = mToKm((lastMonthDistance / lastMonthTime) * 3600);
  const avgSpeedThisMonth = mToKm((thisMonthDistance / thisMonthTime) * 3600);

  return [
    `${mToKm(thisYearDistance)} km`,
    `${mToKm(lastMonthDistance)} km`,
    `${mToKm(thisMonthDistance)} km`,
    `${avgSpeedLastMonth} km/h`,
    `${avgSpeedThisMonth} km/h`,
  ];
}
/**
 * Check if we have Strava's cookie and if this cookie is still valid
 * @return {Boolean}
 */
export function cookieValidationTimeLeft() {
  if (getCookie('expires')) {
    const isExpiredDate = new Date(parseInt(getCookie('expires'), 10) * 1000);
    return isExpiredDate - new Date();
  }
  return null;
}

export function oauthString() {
  const oauthObj = {
    client_id: STRAVA_CLIENT_ID,
    redirect_uri: STRAVA_REDIRECT_URI,
    scope: 'activity:read',
    approval_prompt: 'auto',
    response_type: 'code',
  };
  const oauthParams = Object.keys(oauthObj)
    .map(key => `${key}=${oauthObj[key]}`)
    .join('&');
  return `${oauthEndpoint}authorize?${oauthParams}`;
}

export const getAccessTokenSecrets = {
  client_id: parseInt(STRAVA_CLIENT_ID, 10),
  client_secret: STRAVA_CLIENT_SECRET,
  grant_type: 'authorization_code',
};

export const refreshAccessTokenSecrets = {
  refresh_token: getCookie('refresh_token'),
  client_id: parseInt(STRAVA_CLIENT_ID, 10),
  client_secret: STRAVA_CLIENT_SECRET,
  grant_type: 'refresh_token',
};
