export interface Offer {
  img: ImageOffer[];
  title: string;
  url: string;
  vendorId?: string;
  price: string;
  location?: string
}

interface ImageOffer {
  url: string
}
