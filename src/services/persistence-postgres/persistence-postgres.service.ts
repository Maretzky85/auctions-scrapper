import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ts-postgres';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap, toArray } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';
import { Offer } from '../../models/offer';
import { postgresConfig } from '../../consts';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable()
export class PersistencePostgresService {

  private getClient(): Observable<Client> {
    const client = new Client(postgresConfig);
    return fromPromise(client.connect()).pipe(
      map(() => client));
  }

  insertQuery(searchValue: string, config: string = null): Observable<number> {
    return this.getClient().pipe(
      flatMap(client => {
        return from(client.query('SELECT id FROM activequery WHERE search = $1', [searchValue]))
          .pipe(
            flatMap(searchResult => searchResult.rows.length === 0 ?
              from(client.query('INSERT INTO activequery(search, active, config) VALUES ($1, true, $2)', [searchValue, config]))
                .pipe(tap(() => Logger.debug(`Creating new query ${searchValue}`))) :
              of(searchResult.rows[0][0]).pipe(tap(() => Logger.debug(`Updating existing query ${searchResult.rows[0][0]}`, PersistencePostgresService.name))),
            ),
            flatMap(() => client.query('SELECT id FROM activequery WHERE search = $1', [searchValue])),
            flatMap(value =>
              fromPromise(client.end()).pipe(
                map(() => value.rows[0][0] as number),
              ),
            ),
          );
      }),
    );
  }

  updateQuery(queryNr: number, value: boolean): Observable<any> {
    return this.getClient().pipe(
      flatMap(client => client.query(
        'UPDATE activequery SET active = $1 WHERE id = $2', [value, queryNr],
      )),
      catchError(err => {
        Logger.error(err);
        return throwError(err);
      }));
  }

  insertResults(queryNr: number, offers: Offer[]) {
    let failed = 0;
    return this.getClient().pipe(
      switchMap((client) => from(offers)
        .pipe(flatMap((offer: Offer) =>
            this.saveResult(client, offer, queryNr).pipe(
              catchError((err) => {
                Logger.warn(`Saving of ${offer.title} failed - ${err}`);
                failed++;
                return of(null);
              }),
              map(() => offer ? offer : {}),
            ),
          ),
          toArray(),
          tap(() => {
              Logger.debug(`Saved ${offers.length - failed} offers`, PersistencePostgresService.name);
              return client.end();
            },
          ),
        ),
      ));
  }

  protected saveResult(client, offer, queryNr): Observable<any> {
    return from(client.query(
      'INSERT INTO results' +
      '(img, title, url, price, location, vendorid, query) ' +
      'VALUES ' +
      '($1, $2, $3, $4, $5, $6, $7)',
      [JSON.stringify(offer.img), offer.title, offer.url, offer.price, offer.location, offer.vendorId, queryNr],
    ));
  }

  getResultsForQuery(queryNr: number): Observable<Offer[]> {
    return this.getClient().pipe(
      switchMap((client) => client.query(
        'SELECT * FROM results WHERE query = $1', [queryNr],
      )),
      map(result => this.mapQueryResultToOffer(result.rows)),
    );
  }

  protected mapQueryResultToOffer(results): Offer[] {
    return results.map(result =>
      ({
        id: result[0],
        img: JSON.parse(result[1]),
        title: result[2],
        url: result[3],
        vendorId: result[6],
        price: result[4],
        location: result[5],
      }) as Offer,
    );
  }

  getJobs(): Observable<ActiveQuery[]> {
    return this.getClient().pipe(
      switchMap((client) => client.query(
        'SELECT * FROM activequery',
      )),
      map(result => result.rows),
      map(rows => rows.map(row => {
        return {
          id: row[0],
          search: row[1],
          active: row[2],
          config: row[3],
        } as ActiveQuery;
      })),
    );
  }
}

export interface ActiveQuery {
  id: number,
  active: boolean,
  search: string
  config?: string
}
