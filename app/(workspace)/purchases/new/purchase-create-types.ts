export interface ContactItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
  cost: unknown;
}

export interface AnalyticAccountItem {
  id: string;
  name: string;
}

export interface PurchaseCreateClientProps {
  vendors: ContactItem[];
  products: ProductItem[];
  analyticAccounts: AnalyticAccountItem[];
}
