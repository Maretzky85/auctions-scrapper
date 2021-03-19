import { HttpService, Injectable, Logger, Query } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Offer } from '../../models/offer';

@Injectable()
export class AllegroService {

  constructor(private http: HttpService) {
  }

  private getCredential(): Observable<string> {
    const params = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      grant_type: "client_credentials"
    }
    const headers = {
      Authorization: "Basic NDExMDI2NzM3OTc2NDAzYmFkNjFjZDYxYmVmN2NjMTc6N2pSMmNybnJtblBzQ05jU2ZSblg5cFVYSkZSMHpqR0hCNFVLRnhZbU1PaGpaYTZHTzVKb1ZlZm10Nlc5SENUQg=="
    }
    return this.http.post("https://allegro.pl/auth/oauth/token", {}, { headers, params })
      .pipe(
        map(value => {
          return value.data.access_token;
        }),
        catchError((err, caught) => {
          console.error(err)
          // eslint-disable-next-line @typescript-eslint/camelcase
          return of({access_token: ""})
        })
      )
  }

  search(category: number, phrase: string): Observable<Offer[]> {
    Logger.log(`Allegro service searching for: ${phrase}`, AllegroService.name);
    return this.getCredential().pipe(
      switchMap(token => {
        const params = {
          phrase: phrase,
          "category.id": category,
          "publication.status":"ACTIVE"
        }
        const headers = {
          Accept: "application/vnd.allegro.public.v1+json",
          Authorization: `Bearer ${token}`,
        }
        return this.http.get('https://api.allegro.pl/offers/listing', { headers, params })
          .pipe(
            map(value => [...value.data.items.regular, ...value.data.items.promoted]),
            map(offerList => {
              return offerList
                .filter(offer => offer.sellingMode.format === "BUY_NOW")
                .map(offer => {
                  return {
                    id: offer.id,
                    title: offer.name,
                    img: offer.images,
                    url: offer.vendor?.url ? offer.vendor.url : `https://allegro.pl/oferta/${offer.id}`,
                    price: offer.sellingMode.price.amount};
                })
            }),
            catchError(err => {
              Logger.error(err.response.data.errors[0], AllegroService.name);
              return of([])
            })
          );
      })
    )
  }

}
