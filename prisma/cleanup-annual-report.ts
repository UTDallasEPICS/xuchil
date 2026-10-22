
import prisma from "../src/lib/db";

const PREFIX = "TESTING-DATA";

async function main() {
    // dont run cleanup in production
    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "Annual report cleanup cannot run in production."
        );
    }

    //for all products in the category TESTING-DATA will be deleted
    const products = await prisma.product.findMany({
        where: {
            sku: {
                startsWith: `${PREFIX}-`,
            },
            category: {
                name: "TESTING-DATA",
            },
        },
        include: {
            variants: true,
        },
    });

    const variantIds = products.flatMap((product) =>
        product.variants
            .filter(
                (variant) =>
                    variant.name === product.name &&
                    variant.presentation === "1 unidad"
            )
            .map((variant) => variant.id)
    );

    const orders = await prisma.order.findMany({
        where: {
            clientName: {
                startsWith: `${PREFIX}-`,
            },
            orderItems: {
                some: {
                    productVariantId: { in: variantIds },
                },
            },
        },
        select: {
            id: true,
        },
    });

    const orderIds = orders.map((order) => order.id);

    const runs = await prisma.processRun.findMany({
        where: {
            batchCode: {
                startsWith: `${PREFIX}-`,
            },
            productVariantId: {
                in: variantIds,
            },
        },
        select: {
            id: true,
        },
    });

    const runIds = runs.map((run) => run.id);

    const templates = await prisma.processTemplate.findMany({
        where: {
            productVariantId: {
                in: variantIds,
            },
            name: {
                startsWith: `${PREFIX}-`,
            },
        },
        select: {
            id: true,
        },
    });

    const templateIds = templates.map(
        (template) => template.id
    );

    // Find orders that are NOT part of the seed
    const remainingOrderItems = await prisma.orderItem.findMany({
        where: {
            productVariantId: { in: variantIds },
            orderId: { notIn: orderIds },
        },
        select: {
            id: true,
            orderId: true,
            productVariantId: true,
        },
    });

    // Find process runs that are NOT part of the seed
    const remainingProcessRuns = await prisma.processRun.findMany({
        where: {
            productVariantId: { in: variantIds },
            id: { notIn: runIds },
        },
        select: {
            id: true,
            batchCode: true,
            productVariantId: true,
        },
    });

    // Find templates that are NOT part of the seed
    const remainingTemplates = await prisma.processTemplate.findMany({
        where: {
            productVariantId: { in: variantIds },
            id: { notIn: templateIds },
        },
        select: {
            id: true,
            name: true,
            productVariantId: true,
        },
    });

    console.log(
        "Remaining order items:",
        remainingOrderItems
    );

    console.log(
        "Remaining process runs:",
        remainingProcessRuns
    );

    console.log(
        "Remaining templates:",
        remainingTemplates
    );

    // Protect variants used by records outside the seed
    const protectedVariantIds = new Set([
        ...remainingOrderItems.map(
            (item) => item.productVariantId
        ),
        ...remainingProcessRuns.map(
            (run) => run.productVariantId
        ),
        ...remainingTemplates.map(
            (template) => template.productVariantId
        ),
    ]);

    const safeVariantIds = variantIds.filter(
        (id) => !protectedVariantIds.has(id)
    );

    // Only delete products if all their variants can be deleted
    const safeProductIds = products
        .filter((product) =>
            product.variants.every(
                (variant) =>
                    safeVariantIds.includes(variant.id)
            )
        )
        .map((product) => product.id);

    console.log(
        "Protected variant IDs:",
        [...protectedVariantIds]
    );

    console.log(
        "Safe variant IDs:",
        safeVariantIds
    );

    // delete everything in dependency order
    await prisma.$transaction(async (tx) => {

        //delete seeded order items
        await tx.orderItem.deleteMany({
            where: {
                orderId: { in: orderIds },
            },
        });

        // then delete seeded orders
        await tx.order.deleteMany({
            where: {
                id: { in: orderIds },
            },
        });

        // delete seeded step executions
        await tx.stepExecution.deleteMany({
            where: {
                processRunId: { in: runIds },
            },
        });

        // delete seeded process runs
        await tx.processRun.deleteMany({
            where: {
                id: { in: runIds },
            },
        });

        // only delete template steps if no other runs use them
        const usedTemplateSteps =
            await tx.stepExecution.findMany({
                where: {
                    templateStep: {
                        processTemplateId: {
                            in: templateIds,
                        },
                    },
                },
                select: {
                    templateStepId: true,
                },
            });

        const usedStepIds = new Set(
            usedTemplateSteps.map(
                (step) => step.templateStepId
            )
        );

        const templateSteps =
            await tx.templateStep.findMany({
                where: {
                    processTemplateId: {
                        in: templateIds,
                    },
                },
                select: {
                    id: true,
                },
            });

        const safeStepIds = templateSteps
            .filter(
                (step) => !usedStepIds.has(step.id)
            )
            .map((step) => step.id);

        await tx.templateStep.deleteMany({
            where: {
                id: { in: safeStepIds },
            },
        });

        // preserve templates still referenced by process runs
        const usedTemplates =
            await tx.processRun.findMany({
                where: {
                    processTemplateId: {
                        in: templateIds,
                    },
                },
                select: {
                    processTemplateId: true,
                },
            });

        const usedTemplateIds = new Set(
            usedTemplates.map(
                (run) => run.processTemplateId
            )
        );

        const safeTemplateIds = templateIds.filter(
            (id) => !usedTemplateIds.has(id)
        );

        // Do not delete a template if it still has steps
        const remainingSteps =
            await tx.templateStep.findMany({
                where: {
                    processTemplateId: {
                        in: safeTemplateIds,
                    },
                },
                select: {
                    processTemplateId: true,
                },
            });

        const templatesWithSteps = new Set(
            remainingSteps.map(
                (step) => step.processTemplateId
            )
        );

        const deletableTemplateIds =
            safeTemplateIds.filter(
                (id) => !templatesWithSteps.has(id)
            );

        await tx.processTemplate.deleteMany({
            where: {
                id: { in: deletableTemplateIds },
            },
        });

        //Check for templates that still referencing candidate variants
        const variantsWithTemplates =
            await tx.processTemplate.findMany({
                where: {
                    productVariantId: {
                        in: safeVariantIds,
                    },
                },
                select: {
                    productVariantId: true,
                },
            });

        const stillReferencedIds = new Set(
            variantsWithTemplates.map(
                (template) => template.productVariantId
            )
        );

        //compile the variants that have no variants
        const deletableVariantIds =
            safeVariantIds.filter(
                (id) => !stillReferencedIds.has(id)
            );

        //Delete only variants that are unreferenced
        await tx.productVariant.deleteMany({
            where: {
                id: { in: deletableVariantIds },
            },
        });

        // Delete products that have no remaining variants
        const productsWithVariants =
            await tx.productVariant.findMany({
                where: {
                    productId: {
                        in: safeProductIds,
                    },
                },
                select: {
                    productId: true,
                },
            });
        

        const retainedProductIds = new Set(
            productsWithVariants.map(
                (variant) => variant.productId
            )
        );

        // delete only products that are from the test
        const deletableProductIds =
            safeProductIds.filter(
                (id) => !retainedProductIds.has(id)
            );

        await tx.product.deleteMany({
            where: {
                id: { in: deletableProductIds },
            },
        });

        //only delete data from the testing-data category
        const category = await tx.productCategory.findUnique({
            where: {
                name: "TESTING-DATA",
            },
            include: {
                products: true,
            },
        });

        if (
            category &&
            category.products.length === 0
        ) {
            await tx.productCategory.delete({
                where: {
                    id: category.id,
                },
            });
        }

        // Keep the test unit because other records may use it later
    });

    console.log(
        "Annual report testing-data cleanup done."
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
