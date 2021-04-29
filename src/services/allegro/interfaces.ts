export interface AllegroAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  allegro_api: boolean;
  jti: string;
}

export interface AllegroCategoriesResponse {
  categories: Category[]
}

export interface AllegroMatchingCategoriesResponse {
  matching_categories: Category[]
}

export interface Category {
  id: string;
  name: string;
  parent?: Category;
  leaf?: boolean;
  options?: Options;
}

export interface Options {
  variantsByColorPatternAllowed: boolean;
  advertisement: boolean;
  advertisementPriceOptional: boolean;
  offersWithProductPublicationEnabled: boolean;
  productCreationEnabled: boolean;
  customParametersEnabled: boolean;
}

export interface Seller {
  id: string;
  login: string;
  company: boolean;
  superSeller: boolean;
}

export interface Promotion {
  emphasized: boolean;
  bold: boolean;
  highlight: boolean;
}

export interface LowestPrice {
  amount: string;
  currency: string;
}

export interface Delivery {
  availableForFree: boolean;
  lowestPrice: LowestPrice;
}

export interface Image {
  url: string;
}

export interface Price {
  amount: string;
  currency: string;
}

export interface SellingMode {
  format: string;
  price: Price;
  popularity: number;
}

export interface Stock {
  unit: string;
  available: number;
}

export interface Publication {
  endingAt: Date;
}

export interface Regular {
  id: string;
  name: string;
  seller: Seller;
  promotion: Promotion;
  delivery: Delivery;
  images: Image[];
  sellingMode: SellingMode;
  stock: Stock;
  category: Category;
  publication: Publication;
  vendor?: any;
}

export interface Items {
  promoted: Regular[];
  regular: Regular[];
}

export interface SearchMeta {
  availableCount: number;
  totalCount: number;
  fallback: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  count: number;
}

export interface Path {
  id: string;
  name: string;
}

export interface Categories {
  subcategories: Subcategory[];
  path: Path[];
}

export interface Value {
  value: string;
  name: string;
  count: number;
  selected: boolean;
  idSuffix: string;
}

export interface Filter {
  id: string;
  type: string;
  name: string;
  values: Value[];
  minValue?: number;
  maxValue?: number;
  unit: string;
}

export interface Sort {
  value: string;
  name: string;
  order: string;
  selected: boolean;
}

export interface AllegroAuctionsResponse {
  items: Items;
  searchMeta: SearchMeta;
  categories: Categories;
  filters: Filter[];
  sort: Sort[];
}