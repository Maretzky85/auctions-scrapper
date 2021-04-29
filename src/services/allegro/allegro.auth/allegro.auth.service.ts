import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { AllegroAuthResponse } from '../interfaces';
import { catchError, map } from 'rxjs/operators';
import { AllegroHeader } from './interfaces';
import { allegroCredentials } from '../../../consts';

@Injectable()
export class AllegroAuthService {
  constructor(private http: HttpService) {
  }

  private token = null;

  private getToken(): Observable<string> {
    Logger.debug('Generating new auth token', AllegroAuthService.name);
    const { params, headers } = allegroCredentials;
    return this.http.post<AllegroAuthResponse>(
      'https://allegro.pl/auth/oauth/token', {}, { headers, params })
      .pipe(
        map(response => this.saveAndReturnToken(response.data.access_token)),
        catchError((err) => {
          Logger.error(`There was problem with credentials: ${err}`, AllegroAuthService.name);
          return of(err);
        }),
      );
  }

  getAuthHeaders(): Observable<AllegroHeader> {
    if (!this.token) {
      return this.getToken().pipe(
        map(token => this.createAuthHeader(token)),
      );
    }
    return of(this.createAuthHeader(this.token));
  }

  private createAuthHeader(token: string): AllegroHeader {
    return {
      Accept: 'application/vnd.allegro.public.v1+json',
      Authorization: `Bearer ${token}`,
    };
  }

  private saveAndReturnToken(token: string): string {
    this.token = token;
    return this.token;
  }

}
