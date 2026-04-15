// productsService: product variants, products, units, categories, raw materials
import { sendRequest } from '@/utils/request';

export async function fetchProductVariants() {
  return await sendRequest({ method: 'GET', url: '/api/product-variants', credentials: 'include' });
}

export async function fetchProducts() {
  return await sendRequest({ method: 'GET', url: '/api/products', credentials: 'include' });
}

export async function fetchCategories() {
  return await sendRequest({ method: 'GET', url: '/api/product-categories', credentials: 'include' });
}

export async function fetchUnits() {
  return await sendRequest({ method: 'GET', url: '/api/units', credentials: 'include' });
}

export async function fetchRawMaterials() {
  return await sendRequest({ method: 'GET', url: '/api/rawmaterials', credentials: 'include' });
}
