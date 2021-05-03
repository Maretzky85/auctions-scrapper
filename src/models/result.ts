import { Offer } from './offer';

export interface Result {
  queryNr?: number,
  meta: {
    count: number,
    prices: string[]
  },
  data: Offer[]
}
