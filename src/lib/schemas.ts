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
], "processStatus must be \"PLANNED\", \"IN_PROGRESS\", \"PAUSED\", \"COMPLETED\", or \"CANCELLED\"");

export const StepStatusEnum = z.enum([
    'PENDING',
    'IN_PROGRESS',
    'DONE',
    'BLOCKED',
    'SKIPPED'
], "stepStatus must be \"PENDING\", \"IN_PROGRESS\", \"DONE\", \"BLOCKED\", or \"SKIPPED\"");

export const DeliveryVariantEnum = z.enum([
    'MAIL',
    'PERSONAL',
    'CONSIGNMENT'
], "deliveryVariant must be \"MAIL\", \"PERSONAL\", or \"CONSIGNMENT\"");

export const OrderStatusEnum = z.enum([
    'SCHEDULED',
    'DELIVERED',
    'CANCELLED'
], "orderStatus must be \"SCHEDULED\", \"DELIVERED\", or \"CANCELLED\"");

export const ItemTypeEnum = z.enum([
    'RAW',
    'PRODUCT'
], "itemType must be \"RAW\" or \"PRODUCT\"");

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
    name: z.string(requiredError("name")),
    version: z.number(requiredError("version")).int(typeError("version", "int")),
    isActive: z.boolean(typeError("isActive", "boolean")).optional(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const templateStepSchema = z.strictObject({
    processTemplateId: z.number(requiredError("processTemplateId")).int(typeError("processTemplate", "int")),
    name: z.string(requiredError("name")),
    position: z.number(requiredError("position")).int(typeError("position", "int")),
    idealDurationMin: z.number().int(typeError("idealDurationMin", "int")).optional().nullable(),
    requiresInput: z.boolean(typeError("requiresInput", "boolean")).optional(),
    instructions: z.string(typeError("instructions", "string")).optional().nullable()
})

export const stepExecutionSchema = z.strictObject({
    processRunId: z.number(requiredError("processRunId")).int(typeError("processRunId", "int")),
    templateStepId: z.number(requiredError("templateStepId")).int(typeError("templateStepId", "int")),
    workerId: z.number(typeError("workerId", "int")).int(typeError("workerId", "int")).optional().nullable(),
    status: StepStatusEnum.optional(),
    startedAt: z.date(typeError("startedAt", "date")).optional().nullable(),
    finishedAt: z.date(typeError("finishedAt", "date")).optional().nullable(),
    actualDurationMin: z.number(typeError("actualDurationMin", "int")).int(typeError("actualDurationMin", "int")).optional().nullable(),
    inputQty: z.number(typeError("inputQty", "number")).optional().nullable(),
    inputUnitId: z.number(typeError("inputUnitId", "int")).int(typeError("inputUnitId", "int")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable()
})

export const processRunSchema = z.strictObject({
    productVariantId: z.number(requiredError("productVariantId")).int(typeError("productVariantId", "int")),
    processTemplateId: z.number(requiredError("processTemplateId")).int(typeError("processTemplateId", "int")),
    batchCode: z.string(requiredError("batchCode")),
    createdByWorkerId: z.number(typeError("createdByWorkerId", "int")).int(typeError("createdByWorkerId", "int")).optional().nullable(),
    plannedQty: z.number(typeError("plannedQty", "number")).optional().nullable(),
    plannedUnitId : z.number(typeError("plannedUnitId", "int")).int(typeError("plannedUnitId", "int")).optional().nullable(),
    status: ProcessStatusEnum.optional(),
    startedAt: z.date(typeError("startedAt", "date")).optional().nullable(),
    finishedAt: z.date(typeError("finishedAt", "date")).optional().nullable(),
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
    movedAt: z.date(typeError("movedAt", "date"))
})

export const rawMaterialSchema = z.strictObject({
    code: z.string(requiredError("code")),
    name: z.string(requiredError("name")),
    defaultUnitId: z.number().int(typeError("defaultUnitId", "int")).optional().nullable(),
    imageUrl: z.string(typeError("imageUrl", "string")).optional().nullable(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional()
})

export const productVariantSchema = z.strictObject({
    productId: z.number(requiredError("productId")).int(typeError("productId", "int")),
    name: z.string(requiredError("name")),
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
    clientName: z.string(requiredError("clientName")),
    addressText: z.string(requiredError("addressText")),
    deliveryDate: z.date(requiredError("date")),
    deliveryVariant: DeliveryVariantEnum.optional(),
    orderItems: z.array(orderItemSchema).min(1), // must contain at least 1 item
    status: OrderStatusEnum.optional(),
    deliveredAt: z.date(typeError("deliveredAt", "date")).optional().nullable(),
    consignmentPartner: z.string(typeError("consignmentPartner", "string")).optional().nullable(),
    notes: z.string(typeError("notes", "string")).optional().nullable(),
})

export const authUserSchema = z.strictObject({
    workerId: z.number(typeError("workerId", "int")).int(typeError("workerId", "int")).optional().nullable(),
    email: z.string(requiredError("email")),
    passwordHash: z.string(requiredError("passwordHash")),
    isAdmin: z.boolean(typeError("isAdmin", "boolean")).optional(),
    isActive: z.boolean(typeError("isActive", "boolean")).optional(),
    lastLoginAt: z.date(typeError("lastLoginAt", "boolean")).optional().nullable()
})

export const loginSchema = z.strictObject({

})

export const logoutSchema = z.strictObject({

})