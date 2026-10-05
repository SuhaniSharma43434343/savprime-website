// Re-export stub at the path that app/products/page.tsx imports from:
// '../components/ProductsDropdown' resolves to '@/components/ProductsDropdown'
// This file re-exports everything the products page needs.

import { PRODUCTS as _P, PRODUCT_DATA as _PD } from '@/components/ProductsDropdown'
export const PRODUCTS = _P
export const PRODUCT_DATA = _PD

// Use a loose type alias — the products page accesses .slug which is
// a string literal union on the source array.
export type ProductSlug = string
