// productsService: product variants, products, units, categories, raw materials
import { sendRequest } from '@/utils/request';
import {
  ProductCategoryRead, ProductCategoryReadSchema, ProductCreate,
  ProductRead,
  ProductReadSchema, RawMaterialCreate,
  RawMaterialRead,
  RawMaterialReadSchema, UnitRead, UnitReadSchema
} from "@/lib/schemas";

async function getAllUnits(): Promise<UnitRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/units' });
  return (res).map((item: unknown) => UnitReadSchema.parse(item));
}

async function getAllProducts(): Promise<ProductRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/products' });
  return (res).map((item: unknown) => ProductReadSchema.parse(item));
}

async function getProductById(id: number): Promise<ProductRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/products/${id}` });
  return ProductReadSchema.parse(res);
}

async function getAllProductCategories(): Promise<ProductCategoryRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/product-categories' });
  return (res).map((item: unknown) => ProductCategoryReadSchema.parse(item));
}

async function getAllRawMaterials(): Promise<RawMaterialRead[]> {
  const res = await sendRequest({ method: 'GET', url: '/api/rawmaterials' });
  return (res).map((item: unknown) => RawMaterialReadSchema.parse(item));
}

async function getRawMaterialById(id: number): Promise<RawMaterialRead> {
  const res = await sendRequest({ method: 'GET', url: `/api/rawmaterials/${id}` });
  return RawMaterialReadSchema.parse(res);
}

async function createProduct(payload: ProductCreate): Promise<ProductRead> {
  const productRes = await sendRequest({ method: 'POST', url: `/api/products`, body: payload });
  const product = ProductReadSchema.parse(await productRes.json());
  await sendRequest({ method: 'POST', url: '/api/inventory-items', body: {
    itemType: 'PRODUCT',
    productId: product.id,
  }})
  return product;
}

async function createRawMaterial(payload: RawMaterialCreate): Promise<RawMaterialRead> {
  const materialRes = await sendRequest({ method: 'POST', url: `/api/rawmaterials`, body: payload });
  const material = RawMaterialReadSchema.parse(await materialRes.json());
  await sendRequest({ method: 'POST', url: '/api/inventory-items', body: {
    itemType: 'RAW',
    rawMaterialId: material.id,
  }});
  return material;
}

export default {
  getAllUnits,
  getAllProducts,
  getAllProductCategories,
  getAllRawMaterials,
  getProductById,
  getRawMaterialById,
  createProduct,
  createRawMaterial,
}
