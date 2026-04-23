import { z } from "zod";
import {
  ProcessStatus,
  StepStatus,
  DeliveryVariant,
  OrderStatus,
  ItemType,
  MovementReason,
} from "@prisma/client";

const InputDateTimeString = z.iso.datetime({offset:true}).transform((val) => new Date(val));
const OutputDateTimeString = z.iso.datetime();
const LocalDateString = z.iso.datetime().transform((val) => {
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
})

// Unit
export const UnitCreateSchema = z.strictObject({
  name: z.string(),
});
export const UnitReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export type UnitCreate = z.infer<typeof UnitCreateSchema>;
export type UnitRead = z.infer<typeof UnitReadSchema>;

// ProductCategory
export const ProductCategoryCreateSchema = z.strictObject({
  name: z.string(),
  imgUrl: z.url().optional(),
});
export const ProductCategoryReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  imgUrl: z.url().nullable().optional(),
});
export type ProductCategoryCreate = z.infer<typeof ProductCategoryCreateSchema>;
export type ProductCategoryRead = z.infer<typeof ProductCategoryReadSchema>;

// Product
export const ProductCreateSchema = z.strictObject({
  categoryId: z.number().int(),
  name: z.string(),
  imgUrl: z.url().optional(),
  unitId: z.number().int(),
});
export const ProductReadSchema = z.object({
  id: z.number().int(),
  categoryId: z.number().int(),
  name: z.string(),
  imgUrl: z.url().nullable().optional(),
  unitId: z.number().int(),
  unit: UnitReadSchema,
});
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductRead = z.infer<typeof ProductReadSchema>;

// RawMaterial
export const RawMaterialCreateSchema = z.strictObject({
  name: z.string(),
  unitId: z.number().int(),
  imgUrl: z.url().optional(),
});
export const RawMaterialReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  imgUrl: z.url().nullable().optional(),
  unitId: z.number().int(),
  unit: UnitReadSchema,
});
export type RawMaterialCreate = z.infer<typeof RawMaterialCreateSchema>;
export type RawMaterialRead = z.infer<typeof RawMaterialReadSchema>;

// User
export const UserCreateSchema = z.strictObject({
  name: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  imgUrl: z.url().optional(),
  password: z.string(),
  isAdmin: z.boolean().optional(),
  isGuest: z.boolean().optional(),
});
export const UserRestrictedUpdateSchema = z.strictObject({
  name: z.string(),
  email: z.email().optional(),
  phone: z.string().optional(),
  imgUrl: z.url().optional(),
  password: z.string(),
});
export const UserReadSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email().nullable().optional(),
  phone: z.string().nullable().optional(),
  imgUrl: z.url().nullable().optional(),
  isAdmin: z.boolean(),
  isGuest: z.boolean()
});
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserRestrictedUpdate = z.infer<typeof UserRestrictedUpdateSchema>;
export type UserRead = z.infer<typeof UserReadSchema>;

// ProcessTemplateStepMaterial
export const ProcessTemplateStepMaterialCreateSchema = z.strictObject({
  stepId: z.number().int(),
  rawMaterialId: z.number().int(),
});
export const ProcessTemplateStepMaterialReadSchema = z.object({
  id: z.number().int(),
  stepId: z.number().int(),
  rawMaterialId: z.number().int(),
});
export type ProcessTemplateStepMaterialCreate = z.infer<typeof ProcessTemplateStepMaterialCreateSchema>;
export type ProcessTemplateStepMaterialRead = z.infer<typeof ProcessTemplateStepMaterialReadSchema>;

// ProcessTemplateStep
export const ProcessTemplateStepCreateSchema = z.strictObject({
  processId: z.number().int(),
  position: z.number().int(),
  name: z.string(),
  idealDurationMin: z.number().int().optional(),
  instructions: z.string().optional(),
});
export const ProcessTemplateStepReadSchema = z.object({
  id: z.number().int(),
  processId: z.number().int(),
  position: z.number().int(),
  name: z.string(),
  idealDurationMin: z.number().int().nullable().optional(),
  instructions: z.string().nullable().optional(),
  processTemplateStepMaterials: ProcessTemplateStepMaterialReadSchema.array(),
});
export type ProcessTemplateStepCreate = z.infer<typeof ProcessTemplateStepCreateSchema>;
export type ProcessTemplateStepRead = z.infer<typeof ProcessTemplateStepReadSchema>;

// ProcessTemplate
export const ProcessTemplateCreateSchema = z.strictObject({
  productId: z.number().int(),
  name: z.string(),
});
export const ProcessTemplateReadSchema = z.object({
  id: z.number().int(),
  productId: z.number().int(),
  name: z.string(),
  processTemplateSteps: ProcessTemplateStepReadSchema.array(),
});
export type ProcessTemplateCreate = z.infer<typeof ProcessTemplateCreateSchema>;
export type ProcessTemplateRead = z.infer<typeof ProcessTemplateReadSchema>;

// ProcessPause
export const ProcessPauseCreateSchema = z.strictObject({
  processStepExecutionId: z.number().int(),
  startedAt: InputDateTimeString,
  endedAt: InputDateTimeString.optional(),
});
export const ProcessPauseReadSchema = z.object({
  id: z.number().int(),
  processStepExecutionId: z.number().int(),
  startedAt: OutputDateTimeString,
  endedAt: OutputDateTimeString.nullable().optional(),
});
export type ProcessPauseCreate = z.input<typeof ProcessPauseCreateSchema>;
export type ProcessPauseRead = z.output<typeof ProcessPauseReadSchema>;

// ProcessStepExecution
export const ProcessStepExecutionCreateSchema = z.strictObject({
  processExecutionId: z.number().int(),
  stepId: z.number().int(),
  status: z.enum(StepStatus).optional(),
  startedAt: InputDateTimeString.optional(),
  finishedAt: InputDateTimeString.optional(),
  actualDurationMin: z.number().int().optional(),
  inputQty: z.number().optional(),
  notes: z.string().optional(),
});
export const ProcessStepExecutionReadSchema = z.object({
  id: z.number().int(),
  processExecutionId: z.number().int(),
  stepId: z.number().int(),
  status: z.enum(StepStatus),
  startedAt: OutputDateTimeString.nullable().optional(),
  finishedAt: OutputDateTimeString.nullable().optional(),
  actualDurationMin: z.number().int().nullable().optional(),
  inputQty: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type ProcessStepExecutionCreate = z.input<typeof ProcessStepExecutionCreateSchema>;
export type ProcessStepExecutionRead = z.output<typeof ProcessStepExecutionReadSchema>;

// ProcessExecution
export const ProcessExecutionCreateSchema = z.strictObject({
  processId: z.number().int(),
  batchCode: z.string(),
  plannedQuantity: z.number().optional(),
  status: z.enum(ProcessStatus).optional(),
  startedAt: InputDateTimeString,
  finishedAt: InputDateTimeString.optional(),
  outputQuantity: z.number().optional(),
  scrapQuantity: z.number().optional(),
  notes: z.string().optional(),
});
export const ProcessExecutionReadSchema = z.object({
  id: z.number().int(),
  processId: z.number().int(),
  batchCode: z.string(),
  plannedQuantity: z.number().nullable().optional(),
  status: z.enum(ProcessStatus),
  startedAt: OutputDateTimeString,
  finishedAt: OutputDateTimeString.nullable().optional(),
  outputQuantity: z.number().nullable().optional(),
  scrapQuantity: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  processStepExecutions: ProcessStepExecutionReadSchema.array(),
});
export type ProcessExecutionCreate = z.input<typeof ProcessExecutionCreateSchema>;
export type ProcessExecutionRead = z.output<typeof ProcessExecutionReadSchema>;

// ProcessStepMaterialUsage
export const ProcessStepMaterialUsageCreateSchema = z.strictObject({
  stepExecutionId: z.number().int(),
  rawMaterialId: z.number().int(),
  qtyUsed: z.number(),
  unitId: z.number().int(),
  notes: z.string().optional(),
});
export const ProcessStepMaterialUsageReadSchema = z.object({
  id: z.number().int(),
  stepExecutionId: z.number().int(),
  rawMaterialId: z.number().int(),
  qtyUsed: z.number(),
  unitId: z.number().int(),
  notes: z.string().nullable().optional(),
});
export type ProcessStepMaterialUsageCreate = z.infer< typeof ProcessStepMaterialUsageCreateSchema >;
export type ProcessStepMaterialUsageRead = z.infer< typeof ProcessStepMaterialUsageReadSchema >;

// ProcessStepWorker
export const ProcessStepWorkerCreateSchema = z.strictObject({
  stepExecutionId: z.number().int(),
  workerId: z.number().int(),
});
export const ProcessStepWorkerReadSchema = z.object({
  id: z.number().int(),
  stepExecutionId: z.number().int(),
  workerId: z.number().int(),
});
export type ProcessStepWorkerCreate = z.infer<typeof ProcessStepWorkerCreateSchema>;
export type ProcessStepWorkerRead = z.infer<typeof ProcessStepWorkerReadSchema>;

// InventoryLot
export const InventoryLotCreateSchema = z.strictObject({
  inventoryItemId: z.number().int(),
  lotCode: z.string().optional(),
  quantity: z.number(),
  receivedAt: InputDateTimeString,
  expiryAt: InputDateTimeString.optional(),
});
export const InventoryLotReadSchema = z.object({
  id: z.number().int(),
  inventoryItemId: z.number().int(),
  lotCode: z.string().nullable().optional(),
  quantity: z.number(),
  receivedAt: OutputDateTimeString,
  expiryAt: OutputDateTimeString.nullable().optional(),
});
export type InventoryLotCreate = z.input<typeof InventoryLotCreateSchema>;
export type InventoryLotRead = z.output<typeof InventoryLotReadSchema>;

// InventoryItem
export const InventoryItemCreateSchema = z.strictObject({
  itemType: z.enum(ItemType),
  rawMaterialId: z.number().int().optional(),
  productId: z.number().int().optional(),
});
export const InventoryItemReadSchema = z.object({
  id: z.number().int(),
  itemType: z.enum(ItemType),
  rawMaterialId: z.number().int().nullable().optional(),
  productId: z.number().int().nullable().optional(),
  rawMaterial: RawMaterialReadSchema.nullish(),
  product: ProductReadSchema.nullish(),
  inventoryLots: z.array(InventoryLotReadSchema)
});
export type InventoryItemCreate = z.infer<typeof InventoryItemCreateSchema>;
export type InventoryItemRead = z.infer<typeof InventoryItemReadSchema>;

// InventoryMovement
export const InventoryMovementCreateSchema = z.strictObject({
  inventoryLotId: z.number().int(),
  quantityChange: z.number(),
  reason: z.enum(MovementReason),
  relatedStepMaterialUsageId: z.number().int().optional(),
  relatedProcessExecutionId: z.number().int().optional(),
  relatedOrderId: z.number().int().optional(),
  note: z.string().optional(),
  movedAt: InputDateTimeString,
});
export const InventoryMovementReadSchema = z.object({
  id: z.number().int(),
  inventoryLotId: z.number().int(),
  quantityChange: z.number(),
  reason: z.enum(MovementReason),
  relatedStepMaterialUsageId: z.number().int().nullable().optional(),
  relatedProcessExecutionId: z.number().int().nullable().optional(),
  relatedOrderId: z.number().int().nullable().optional(),
  note: z.string().nullable().optional(),
  movedAt: OutputDateTimeString,
});
export type InventoryMovementCreate = z.input< typeof InventoryMovementCreateSchema >;
export type InventoryMovementRead = z.output< typeof InventoryMovementReadSchema >;

// OrderItem
export const OrderItemCreateSchema = z.strictObject({
  orderId: z.number().int(),
  productId: z.number().int(),
  quantity: z.number(),
});
export const OrderItemReadSchema = z.object({
  id: z.number().int(),
  orderId: z.number().int(),
  productId: z.number().int(),
  quantity: z.number(),
});
export type OrderItemCreate = z.infer<typeof OrderItemCreateSchema>;
export type OrderItemRead = z.infer<typeof OrderItemReadSchema>;

// Order
export const OrderCreateSchema = z.strictObject({
  clientName: z.string(),
  address: z.string().optional(),
  deliveryDate: InputDateTimeString,
  deliveryVariant: z.enum(DeliveryVariant).optional(),
  status: z.enum(OrderStatus).optional(),
  deliveredAt: InputDateTimeString.optional(),
  consignmentPartner: z.string().optional(),
  notes: z.string().optional(),
});
export const OrderReadSchema = z.object({
  id: z.number().int(),
  clientName: z.string(),
  address: z.string().nullable().optional(),
  deliveryDate: LocalDateString,
  deliveryVariant: z.enum(DeliveryVariant),
  status: z.enum(OrderStatus),
  deliveredAt: z.nullish(LocalDateString),
  consignmentPartner: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  orderItems: OrderItemReadSchema.array(),
});
export type OrderCreate = z.input<typeof OrderCreateSchema>;
export type OrderRead = z.output<typeof OrderReadSchema>;
