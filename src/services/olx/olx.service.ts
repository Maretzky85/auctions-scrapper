import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Offer } from '../../models/offer';
import { ISearch } from '../ISearch';

@Injectable()
export class OlxService implements ISearch {

  search(search: string): Observable<Offer[]> {
    Logger.log(`Olx service searching for ${search}`, OlxService.name);
    const searchUrl = `https://www.olx.pl/oferty/q-${search}/`;
    return from(puppeteer.launch()).pipe(
      switchMap(browser => browser.newPage()),
      switchMap(page => page.goto(searchUrl).then(() => page)),
      switchMap(page => page.evaluate(() => {
        const offers = Array.from(document.querySelectorAll('.offer-wrapper'));
        return offers.map(offer => {
          const urlAddr = offer.querySelector('.link')?.getAttribute('href');
          return {
            // @ts-ignore
            img: [{ url: offer.querySelector('.fleft')?.src }],
            title: offer.querySelector('strong')?.innerText,
            url: urlAddr.slice(0, urlAddr.indexOf('#')),
            price: offer.querySelector('.price strong')?.innerHTML || 'none',
            // @ts-ignore
            location: offer.querySelectorAll('.breadcrumb')[1].innerText.trim(),
          } as Offer;
        });
      })),
      tap(results => Logger.debug(`Olx found ${results.length} items`, OlxService.name)),
      catchError((err) => {
        Logger.log('Olx search error', err);
        return of([]);
      }),
    );
  }

}
