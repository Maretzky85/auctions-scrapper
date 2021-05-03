import { Offer } from '../models/offer';
import { Observable } from 'rxjs';

export interface ISearch {
  search(phrase: string, config: any): Observable<Offer[]>
}