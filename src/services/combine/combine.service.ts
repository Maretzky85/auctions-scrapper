import { Injectable } from '@nestjs/common';
import { forkJoin, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllegroService } from '../allegro/allegro.service';
import { OlxService } from '../olx/olx.service';
import { Result } from '../../models/result';
import { Offer } from '../../models/offer';

@Injectable()
export class CombineService {

  constructor(private allegroService: AllegroService,
              private olxService: OlxService) {
  }

  searchAll(search: string, allegroCategory = null): Observable<Result> {
    return forkJoin([this.allegroService.search(search, allegroCategory), from(this.olxService.search(search))])
      .pipe(map(([allegro, olx]) => {
        const data = this.offerPriseNormalizer([...allegro, ...olx]);
        return {
          meta: {
            count: data.length,
            prices: data.map(offer => offer.price)
          },
          data: data as Offer[]
        };
      }))
  }

  private offerPriseNormalizer(offers: Offer[]): Offer[] {
    offers.map(offer => {
      offer.price = this.priseNormalizer(offer.price);
    })
    return offers;
  }

  private priseNormalizer(price: string): string {
    price = price.replace(/\s/g,'');
    price = price.endsWith('zł') ? price.slice(0, -2) : price;
    price = price.includes(".") ? price.slice(0, price.indexOf(".")) : price;
    return price;
  }
}
