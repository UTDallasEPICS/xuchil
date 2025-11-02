import * as z from "zod";

const requiredError = (label: string)=> ({
    error: (iss: {input: unknown}) => iss.input === undefined
    ? `${label} is required.`: `${label} is invalid.`
})

const typeError = (label: string, type:string)=> ({
    error: `${label} must be ${type}.`
})

export const ProcessStatusEnum = z.enum([
    'PLANNED',
    'IN_PROGRESS',
    'PAUSED',
    'COMPLETED',
    'CANCELLED'
    ], {
    error: (iss): string => `Expected ${Object.values(ProcessStatusEnum.def.entries)}, received ${iss.input}`,
});

export const StepStatusEnum = z.enum([
    'PENDING',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED',
    'SKIPPED'
    ], {
    error: (iss): string => `Expected ${Object.values(StepStatusEnum.def.entries)}, received ${iss.input}`,
});

export const DeliveryVariantEnum = z.enum([
    'MAIL',
    'PERSONAL',
    'CONSIGNMENT'
    ], {
    error: (iss): string => `Expected ${Object.values(DeliveryVariantEnum.def.entries)}, received ${iss.input}`,
});

export const OrderStatusEnum = z.enum([
    'SCHEDULED',
    'DELIVERED',
    'CANCELLED'
    ], {
    error: (iss): string => `Expected ${Object.values(OrderStatusEnum.def.entries)}, received ${iss.input}`,
});

export const ItemTypeEnum = z.enum([
    'RAW',
    'PRODUCT'
    ], {
    error: (iss): string => `Expected ${Object.values(ItemTypeEnum.def.entries)}, received ${iss.input}`,
});

export const MovementDirectionEnum = z.enum([
    'IN',
    'OUT'
], requiredError("movementDirection"));

export const MovmementReasonEnum = z.enum([
    'PURCHASE',
    'CONSUMPTION_STEP',
    'ADJUSTMENT',
    'COMPLETION_RUN',
    'OUTBOUND_ORDER'
], requiredError("movementReason"));

export const processTemplateSchema = z.strictObject({
    productVariantId: z.number(requiredError("productVariantId")).int(typeError("productVariantId", "int")),
    name: z.string(requiredError("name")).min(1, "name cannot be empty."),
    version: z.number(typeError("version", "number")).int(typeError("version", "int")).optional(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const templateStepSchema = z.strictObject({
    processTemplateId: z.number(requiredError("processTemplateId")).int(typeError("processTemplate", "int")),
    name: z.string(requiredError("name")).min(1, "name cannot be empty."),
    position: z.number(typeError("position", "number")).int(typeError("position", "int")).optional(),
    idealDurationMin: z.number().int(typeError("idealDurationMin", "int")).optional().nullable(),
    requiresInput: z.boolean(typeError("requiresInput", "boolean")).optional(),
    instructions: z.string(typeError("instructions", "string")).optional().nullable()
})

export const stepExecutionSchema = z.strictObject({
    processRunId: z.number(requiredError("processRunId")).int(typeError("processRunId", "int")),
    templateStepId: z.number(requiredError("templateStepId")).int(typeError("templateStepId", "int")),
    workerId: z.number(typeError("workerId", "int")).int(typeError("workerId", "int")).optional().nullable(),
    status: StepStatusEnum.optional(),
    startedAt: z.iso.datetime(typeError("startedAt", "date")).optional().nullable(),
    finishedAt: z.iso.datetime(typeError("finishedAt", "date")).optional().nullable(),
    actualDurationMin: z.number(typeError("actualDurationMin", "int")).int(typeError("actualDurationMin", "int")).optional().nullable(),
    inputQty: z.number(typeError("inputQty", "number")).optional().nullable(),
    inputUnitId: z.number(typeError("inputUnitId", "int")).int(typeError("inputUnitId", "int")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const processRunSchema = z.strictObject({
    productVariantId: z.number(requiredError("productVariantId")).int(typeError("productVariantId", "int")),
    processTemplateId: z.number(requiredError("processTemplateId")).int(typeError("processTemplateId", "int")),
    batchCode: z.string(requiredError("batchCode")).min(1, "batchCode cannot be empty."),
    createdByWorkerId: z.number(typeError("createdByWorkerId", "int")).int(typeError("createdByWorkerId", "int")).optional().nullable(),
    plannedQty: z.number(typeError("plannedQty", "number")).optional().nullable(),
    plannedUnitId : z.number(typeError("plannedUnitId", "int")).int(typeError("plannedUnitId", "int")).optional().nullable(),
    status: ProcessStatusEnum.optional(),
    startedAt: z.iso.datetime(typeError("startedAt", "date")).optional().nullable(),
    finishedAt: z.iso.datetime(typeError("finishedAt", "date")).optional().nullable(),
    goodOutputQty: z.number(typeError("goodOutputQty", "number")).optional().nullable(),
    scrapQty: z.number(typeError("scrapQty", "number")).optional().nullable(),
    outputUnitId: z.number(typeError("outputUnitId", "int")).int(typeError("outputUnitId", "int")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const inventoryMovementSchema = z.strictObject({
    inventoryLotId: z.number(requiredError("inventoryLotId")).int(typeError("inventoryLotId", "int")),
    direction: MovementDirectionEnum,
    qty: z.number(requiredError("qty")),
    unitId: z.number(requiredError("unitId")).int(typeError("unitId", "int")),
    reason: MovmementReasonEnum,
    relatedStepExecutionId: z.number().int(typeError("relatedStepExecutionId", "int")).optional(),
    relatedProcessRunId: z.number().int(typeError("relatedProcessRunId", "int")).optional(),
    relatedOrderId: z.number().int(typeError("requiredOrderId", "int")).optional(),
    note: z.string(typeError("note", "string")).optional().nullable(),
    movedAt: z.iso.datetime(typeError("movedAt", "date"))
})

export const rawMaterialSchema = z.strictObject({
    code: z.string(requiredError("code")).min(1, "code cannot be empty."),
    name: z.string(requiredError("name")).min(1, "name cannot be empty."),
    defaultUnitId: z.number().int(typeError("defaultUnitId", "int")).optional().nullable(),
    imageUrl: z.string(typeError("imageUrl", "string")).optional().nullable(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional()
})

export const productVariantSchema = z.strictObject({
    productId: z.number(requiredError("productId")).int(typeError("productId", "int")),
    name: z.string(requiredError("name")).min(1, "name cannot be empty."),
    presentation: z.string(typeError("presentation", "string")).optional().nullable(),
    netContent: z.number("netContent must be a number").optional().nullable(),
    contentUnitId: z.number(typeError("contentUnitId", "int")).int(typeError("contentUnitId", "int")).optional().nullable(),
    defaultUnitId: z.number(typeError("defaultUnitId", "int")).int(typeError("defaultUnitId", "int")).optional().nullable(),
    imageUrl: z.string(typeError("imageUrl", "string")).optional().nullable(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional()
})

export const orderItemSchema = z.strictObject({
    // orderId: z.number().int(),
    productVariantId: z.number(requiredError("productVariantId")).int(typeError("productVariantId", "int")),
    quantity: z.number(requiredError("quantity")),
    unitId: z.number(typeError("unitId", "int")).int(typeError("unitId", "int")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const orderSchema = z.strictObject({
    clientName: z.string(requiredError("clientName")).min(1, "clientName cannot be empty."),
    addressText: z.string(requiredError("addressText")).min(1, "addressText cannot be empty."),
    deliveryDate: z.iso.datetime(requiredError("date")),
    deliveryVariant: DeliveryVariantEnum.optional(),
    orderItems: z.array(orderItemSchema).min(1, "order must contain at least one item."), // must contain at least 1 item
    status: OrderStatusEnum.optional(),
    deliveredAt: z.iso.datetime(typeError("deliveredAt", "date")).optional().nullable(),
    consignmentPartner: z.string(typeError("consignmentPartner", "string")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable(),
})

export const authUserSchema = z.strictObject({
    workerId: z.number(typeError("workerId", "int")).int(typeError("workerId", "int")).optional().nullable(),
    email: z.string(requiredError("email")).min(1, "email cannot be empty."),
    passwordHash: z.string(requiredError("passwordHash")).min(1, "passwordHash cannot be empty."),
    isAdmin: z.boolean(typeError("isAdmin", "boolean")).optional(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional(),
    lastLoginAt: z.iso.datetime(typeError("lastLoginAt", "boolean")).optional().nullable()
})

export const loginSchema = z.strictObject({

})

export const logoutSchema = z.strictObject({

})