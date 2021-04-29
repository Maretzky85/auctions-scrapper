import { HttpService, Injectable, Logger } from '@nestjs/common';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { Offer } from '../../models/offer';
import {
  AllegroAuctionsResponse,
  AllegroCategoriesResponse, AllegroMatchingCategoriesResponse,
  Category, Regular,
} from './interfaces';
import { AllegroAuthService } from './allegro.auth/allegro.auth.service';

@Injectable()
export class AllegroService {

  constructor(private http: HttpService, private authService: AllegroAuthService) {
  }

  getPredictedCategoryForSearch(search: string): Observable<Category[]> {
    const params = { name: search };

    return this.authService.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<AllegroMatchingCategoriesResponse>
        ('https://api.allegro.pl/sale/matching-categories', { headers, params }).pipe(
        map(response => response.data.matching_categories)),
      ),
    );
  }

  getPredictedCategoryIdForSearch(search: string): Observable<string> {
    return this.getPredictedCategoryForSearch(search).pipe(
      map(category => category[0].id)
    )
  }

  getCategoryList(): Observable<Category[]> {
    return this.authService.getAuthHeaders().pipe(
      switchMap(headers => this.http.get<AllegroCategoriesResponse>
        ('https://api.allegro.pl/sale/categories', { headers }).pipe(
        map(response => response.data.categories)),
      ),
    );
  }

  search(phrase: string, category: string = null): Observable<Offer[]> {
    Logger.log(`Allegro service searching for: ${phrase}`, AllegroService.name);
    return forkJoin([this.getPredictedCategoryIdForSearch(phrase), this.authService.getAuthHeaders()]).pipe(
      switchMap(([predictedCategory, headers]) => {
        const params = {
          phrase,
          'category.id': category ? category : predictedCategory,
          'publication.status': 'ACTIVE',
        };
        return this.http.get<AllegroAuctionsResponse>('https://api.allegro.pl/offers/listing', { headers, params })
          .pipe(
            map(value => [...value.data.items.regular, ...value.data.items.promoted]),
            filter(([offer]) => offer.sellingMode.format === 'BUY_NOW'),
            map(offerList => this.allegroListingToOffer(offerList)),
            catchError(err => {
              Logger.error(err.response.data.errors[0], AllegroService.name);
              return of([]);
            }),
          );
      }),
    )
  }

  protected allegroListingToOffer(listing: Regular[]): Offer[] {
    return listing.map(listingItem => ({
      id: listingItem.id,
      title: listingItem.name,
      img: listingItem.images,
      url: listingItem.vendor?.url ? listingItem.vendor.url : `https://allegro.pl/oferta/${listingItem.id}`,
      price: listingItem.sellingMode.price.amount
    }))
  }

}
