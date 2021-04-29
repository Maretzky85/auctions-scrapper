import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Offer } from '../../models/offer';

@Injectable()
export class OlxService {

  searchOlx(search: string): Observable<Offer[]> {
    Logger.log(`Olx service searching for ${search}`, OlxService.name);
    const searchUrl = `https://www.olx.pl/oferty/q-${search}/`
    return from(puppeteer.launch()).pipe(
      switchMap(browser => browser.newPage()),
      switchMap(page => page.goto(searchUrl).then(() => page)),
      switchMap(page => page.evaluate(() => {
        const offers = Array.from(document.querySelectorAll(".offer-wrapper"));
        return offers.map(offer => {
          const urlAddr = offer.querySelector('.link')?.getAttribute('href')
          return {
            // @ts-ignore
            img: [{url: offer.querySelector('.fleft')?.src}],
            title: offer.querySelector('strong')?.innerText,
            url: urlAddr.slice(0, urlAddr.indexOf("#")),
            price: offer.querySelector('.price strong')?.innerHTML || "none",
            // @ts-ignore
            location: offer.querySelectorAll('.breadcrumb')[1].innerText.trim()
          } as Offer;
        });
      })),
      catchError(() => {
        Logger.log('Olx search error');
        return of([]);
      })
    )
  }

}
