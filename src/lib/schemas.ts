import * as z from "zod";

export const ProcessStatusEnum = z.enum([
    'PLANNED',
    'IN_PROGRESS',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
]);

export const StepStatusEnum = z.enum([
    'PENDING',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED',
    'SKIPPED'
]);

export const DeliveryVariantEnum = z.enum([
    'MAIL',
    'PERSONAL',
    'CONSIGNMENT'
]);

export const OrderStatusEnum = z.enum([
    'SCHEDULED',
    'DELIVERED',
    'CANCELLED'
]);

export const ItemTypeEnum = z.enum([
    'RAW',
    'PRODUCT'
]);

export const MovementDirectionEnum = z.enum([
    'IN',
    'OUT'
]);

export const MovmementReasonEnum = z.enum([
    'PURCHASE',
    'CONSUMPTION_STEP',
    'ADJUSTMENT',
    'COMPLETION_RUN',
    'OUTBOUND_ORDER'
]);

export const processTemplateSchema = z.strictObject({
    productVariantID: z.number().int(),
    name: z.string(),
    version: z.number().int(),
    isActive: z.boolean().optional(),
    notes: z.string().optional().nullable()
})

export const templateStepSchema = z.strictObject({
    processTemplateId: z.number().int(),
    name: z.string(),
    position: z.number().int(),
    idealDurationMin: z.number().optional().nullable(),
    requiresInput: z.boolean().optional(),
    instructions: z.string().optional().nullable()
})

export const stepExecutionSchema = z.strictObject({
    processRunId: z.number().int(),
    templateStepId: z.number().int(),
    workerId: z.number().int().optional().nullable(),
    status: StepStatusEnum.optional(),
    startedAt: z.date().optional().nullable(),
    finishedAt: z.date().optional().nullable(),
    actualDurationMin: z.number().optional().nullable(),
    inputQty: z.number().optional().nullable(),
    inputUnitId: z.number().int().optional().nullable(),
    notes: z.string().optional().nullable()
})

export const processRunSchema = z.strictObject({
    productVariantId: z.number().int(),
    processTemplateId: z.number().int(),
    batchCode: z.string(),
    createdByWorkerId: z.number().int().optional().nullable(),
    plannedQty: z.number().optional().nullable(),
    plannedUnitId : z.number().int().optional().nullable(),
    status: ProcessStatusEnum.optional(),
    startedAt: z.date().optional().nullable(),
    finishedAt : z.date().optional().nullable(),
    goodOutputQty: z.number().optional().nullable(),
    scrapQty: z.number().optional().nullable(),
    outputUnitId: z.number().int().optional().nullable(),
    notes: z.string().optional().nullable()
})

export const inventoryMovementSchema = z.strictObject({
    inventoryLotId: z.number().int(),
    direction: MovementDirectionEnum,
    qty: z.number(),
    unitId: z.number().int(),
    reason: MovmementReasonEnum,
    relatedStepExecutionId: z.number().int(),
    relatedProcessRunId: z.number().int(),
    relatedOrderId: z.number().int(),
    note: z.string().optional().nullable(),
    movedAt: z.date()
})

export const rawMaterialSchema = z.strictObject({
    code: z.string(),
    name: z.string(),
    defaultUnitId: z.number().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().optional()
})

export const productVariantSchema = z.strictObject({
    productId: z.number().int(),
    name: z.string(),
    presentation: z.string().optional().nullable(),
    netContent: z.number().optional().nullable(),
    contentUnitId: z.number().optional().nullable(),
    defaultUnitId: z.number().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    isActive: z.boolean().optional()
})

export const orderItemSchema = z.strictObject({
    // orderId: z.number().int(),
    productVariantId: z.number().int(),
    quantity: z.number(),
    unitId: z.number().int().optional().nullable(),
    notes: z.string().optional().nullable()
})

export const orderSchema = z.strictObject({
    clientName: z.string(),
    addressText: z.string(),
    deliveryDate: z.date(),
    deliveryVariant: DeliveryVariantEnum.optional(),
    orderItems: z.array(orderItemSchema).min(1), // must contain at least 1 item
    // status: z.enum(['SCHEDULED', 'DELIVERED', 'CANCELLED']).optional(),
    // deliveredAt: z.date().optional().nullable(),
    consignmentPartner: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export const authUserSchema = z.strictObject({
    workerId: z.number().int().optional().nullable(),
    email: z.string(),
    passwordHash: z.string(),
    isAdmin: z.boolean().optional(),
    isActive: z.boolean().optional(),
    lastLoginAt: z.date().optional().nullable()
})

export const loginSchema = z.strictObject({

})

export const logoutSchema = z.strictObject({

})