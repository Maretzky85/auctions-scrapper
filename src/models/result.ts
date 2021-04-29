import { Offer } from './offer';

export interface Result {
  meta: {
    count: number,
    prices: string[]
  },
  data: Offer[]
}
