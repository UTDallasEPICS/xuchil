// productsService: product variants, products, units, categories, raw materials
import { sendRequest } from '@/utils/request';
import {
  ProductCategoryRead, ProductCategoryReadSchema, ProductCreate,
  ProductRead,
  ProductReadSchema, RawMaterialCreate,
  RawMaterialRead,
  RawMaterialReadSchema
} from "@/lib/schemas";

async function getAllProducts(): Promise<ProductRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/products' });
  return (await res.json()).map((item: unknown) => ProductReadSchema.parse(item));
}

async function getAllProductCategories(): Promise<ProductCategoryRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/product-categories' });
  return (await res.json()).map((item: unknown) => ProductCategoryReadSchema.parse(item));
}

async function getAllRawMaterials(): Promise<RawMaterialRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/rawmaterials' });
  return (await res.json()).map((item: unknown) => RawMaterialReadSchema.parse(item));
}

async function createProduct(payload: ProductCreate): Promise<ProductRead> {
  const res = await sendRequest({ method: 'POST', url: `/api/products`, body: payload });
  return ProductReadSchema.parse(await res.json());
}

async function createRawMaterial(payload: RawMaterialCreate): Promise<RawMaterialRead> {
  const res = await sendRequest({ method: 'POST', url: `/api/rawmaterials`, body: payload });
  return RawMaterialReadSchema.parse(await res.json());
}

export {
  getAllProducts,
  getAllProductCategories,
  getAllRawMaterials,
  createProduct,
  createRawMaterial,
}
