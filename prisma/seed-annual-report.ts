import prisma from "../src/lib/db";
import type { ProductVariant } from "@prisma/client";

const PREFIX = "test";

async function main(){
    const category = await prisma.productCategory.upsert({
        where: {name: "Test"},
        update: {},
        create: { name: "Test"},
    });

    const unit = await prisma.unit.upsert({
        where: {name: "Test unit"},
        update: {},
        create: {name:"Test unit"},
    });


    const variants: ProductVariant[] = await Promise.all(
        Array.from({ length: 35 }, async (_, index) => {
            const i = index + 1;
            const sku = `${PREFIX}-${i}`;
            const name = `Producto de prueba ${i}`;

            const product = await prisma.product.upsert({
                where: { sku },
                update: {},
                create: {
                    sku,
                    name,
                    categoryId: category.id,
                },
            });

            const variant = await prisma.productVariant.upsert({
                where: {
                    productId_name: {
                        productId: product.id,
                        name,
                    },
                },
                update: {},
                create: {
                    productId: product.id,
                    name,
                    presentation: "1 unidad",
                    defaultUnitId: unit.id,
                },
            });

            return variant;
        })
    );

    // Create test orders of different status, delivery variant, etc.
    async function createTestOrder(
        label: string,
        date: string,
        status: "DELIVERED" | "CANCELLED" | "SCHEDULED",
        variantId: number,
        quantity: number,
        deliveryVariant: "MAIL" | "PERSONAL" | "CONSIGNMENT" = "MAIL"
    ) {
        const clientName = `${PREFIX}-${label}`;

        const existing = await prisma.order.findFirst({
            where: { clientName },
        });

        if (existing) return;

        await prisma.order.create({
            data: {
                clientName,
                deliveryDate: new Date(date),
                status,
                deliveryVariant,
                deliveredAt:
                    status === "DELIVERED" ? new Date(date) : null,
                orderItems: {
                    create: [{
                        productVariantId: variantId,
                        quantity,
                        unitId: unit.id,
                    }],
                },
            },
        });
    }

    // test out the 2025 and 2026 boundary
    await createTestOrder(
        "end-2025",
        "2025-12-31T23:59:00.000Z",
        "DELIVERED",
        variants[0].id,
        10
    );

    await createTestOrder(
        "start-2026",
        "2026-01-01T00:01:00.000Z",
        "DELIVERED",
        variants[0].id,
        20
    );

    // test out the cancelled and scheduled orders
    await createTestOrder(
        "cancelled-2026",
        "2026-03-10T12:00:00.000Z",
        "CANCELLED",
        variants[1].id,
        5
    );

    await createTestOrder(
        "scheduled-2026",
        "2026-04-10T12:00:00.000Z",
        "SCHEDULED",
        variants[1].id,
        8
    );

    // create 35 delivered orders to test if the PDF page breaks are correct
    await Promise.all(
        variants.map((variant, i) =>
            createTestOrder(
                `bulk-${i + 1}`,
                "2026-06-15T12:00:00.000Z",
                "DELIVERED",
                variant.id,
                i + 1,
                i % 2 === 0 ? "MAIL" : "PERSONAL"
            )
        )
    );

    // Create a process template that has two steps, mixing and packaging
    const template = await prisma.processTemplate.upsert({
        where: {
            productVariantId_version: {
                productVariantId: variants[0].id,
                version: 1,
            },
        },
        update: {},
        create: {
            productVariantId: variants[0].id,
            version: 1,
            name: `${PREFIX}-Cookies`,
        },
    });

    const mixing = await prisma.templateStep.upsert({
        where: {
            processTemplateId_position: {
                processTemplateId: template.id,
                position: 1,
            },
        },
        update: {},
        create: {
            processTemplateId: template.id,
            position: 1,
            name: "Mixing",
            idealDurationMin: 30,
        },
    });

    const packaging = await prisma.templateStep.upsert({
        where: {
            processTemplateId_position: {
                processTemplateId: template.id,
                position: 2,
            },
        },
        update: {},
        create: {
            processTemplateId: template.id,
            position: 2,
            name: "Packaging",
            idealDurationMin: 20,
        },
    });

    //Create process runs with different statuses and actual time taken
    async function createTestRun(
        code: string,
        status: "COMPLETED" | "IN_PROGRESS" | "CANCELLED",
        startedAt: string,
        actualMinutes: number,
        skipPackaging = false
    ) {
        const batchCode = `${PREFIX}-${code}`;

        const existing = await prisma.processRun.findUnique({
            where: { batchCode },
        });

        if (existing) return;

        await prisma.processRun.create({
            data: {
                batchCode,
                productVariantId: variants[0].id,
                processTemplateId: template.id,
                status,
                startedAt: new Date(startedAt),
                finishedAt:
                    status === "COMPLETED"
                        ? new Date(new Date(startedAt).getTime() + 3600000)
                        : null,
                stepExecutions: {
                    create: [
                        {
                            templateStepId: mixing.id,
                            status: "DONE",
                            actualDurationMin: actualMinutes,
                        },
                        {
                            templateStepId: packaging.id,
                            status: skipPackaging ? "SKIPPED" : "DONE",
                            actualDurationMin: skipPackaging ? null : 25,
                        },
                    ],
                },
            },
        });
    }

    //create 5 process test runs

    await createTestRun(
        "completed-2025",
        "COMPLETED",
        "2025-12-31T23:00:00.000Z",
        35
    );

    await createTestRun(
        "completed-2026-A",
        "COMPLETED",
        "2026-02-10T10:00:00.000Z",
        40
    );

    await createTestRun(
        "completed-2026-B",
        "COMPLETED",
        "2026-03-10T10:00:00.000Z",
        25,
        true
    );

    await createTestRun(
        "in-progress-2026",
        "IN_PROGRESS",
        "2026-04-10T10:00:00.000Z",
        100
    );

    await createTestRun(
        "cancelled-2026",
        "CANCELLED",
        "2026-05-10T10:00:00.000Z",
        200
    );

}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });