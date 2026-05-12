export type Retailer = 'Amazon' | 'Lowe\'s' | 'Home Depot';

export interface SourcingItem {
  id: string;
  name: string;
  retailer: Retailer;
  price: number;
  quantity: number;
  url?: string;
  approved: boolean;
}

export interface SourcingCart {
  items: SourcingItem[];
  total: number;
}