import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'ts-postgres';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, toArray } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';
import { Offer } from '../../models/offer';
import { postgresConfig } from '../../consts';

@Injectable()
export class PersistencePostgresService {

  private static postgres: Client
  private static connected = false;
  private static connecting = false;
  private static instance = 0;
  constructor() {
    ++PersistencePostgresService.instance;
    PersistencePostgresService.postgres = new Client(postgresConfig);
    if (!PersistencePostgresService.connecting && PersistencePostgresService.instance === 1) {
      PersistencePostgresService.connecting = true;
      PersistencePostgresService.postgres.connect().then(() => PersistencePostgresService.connected = true);
    }
  }

  private getClient() {
    return PersistencePostgresService.postgres;
  }

  insertQuery(searchValue: string): Observable<number> {
    return of(this.getClient().query(
        "INSERT INTO activequery(search, active) VALUES ($1, true)", [searchValue]
      )).pipe(
      switchMap(() => this.getClient().query(
        "SELECT id FROM activequery WHERE search = $1", [searchValue]
      )),
      switchMap(result => {
        return of(result.rows[0][0] as number);
      }),
      catchError(err => {
        Logger.error(err);
        return throwError(err);
      }))
  }

  updateQuery(queryNr: number, value: boolean): Observable<any> {
    return of(this.getClient().query(
      "UPDATE activequery SET active = $1 WHERE id = $2", [value, queryNr]
    )).pipe(
      catchError(err => {
        Logger.error(err)
        return throwError(err);
      })
    )
  }

  insertResults(queryNr: number, offer: Offer[]) {
    return from(offer).pipe(
      flatMap(offer => {
        Logger.log(`saving ${offer.title}`, PersistencePostgresService.name);
        return this.getClient().query(
          "INSERT INTO results" +
          "(img, title, url, price, location, vendorid, query) " +
          "VALUES " +
          "($1, $2, $3, $4, $5, $6, $7)",
          [JSON.stringify(offer.img), offer.title, offer.url, offer.price, offer.location, offer.vendorId, queryNr]
        )
      }),
      catchError((err) => {
        Logger.warn(err);
        return of([]);
      }),
      toArray(),
      catchError(err => {
        Logger.error(err, PersistencePostgresService.name);
        return throwError(err);
      })
    )
  }

  getResultsForQuery(queryNr: number): Observable<any[]> {
    return of(PersistencePostgresService.postgres).pipe(
      switchMap(() => this.getClient().query(
        "SELECT * FROM results WHERE query = $1", [queryNr]
      )),
      map(result => result.rows )
    )
  }

  getJobs(): Observable<ActiveQuery[]> {
    return of(PersistencePostgresService.postgres).pipe(
      switchMap(() => this.getClient().query(
        "SELECT * FROM activequery"
      )),
      map(result => result.rows ),
      map(rows => rows.map(row => {
        return {
          id: row[0],
          search: row[1],
          active: row[2]
        } as ActiveQuery
      }))
    )
  }
}

export interface ActiveQuery {
  id: number,
  active: boolean,
  search: string
}
