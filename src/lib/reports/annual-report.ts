import prisma from "@/lib/db";
import {
    AnnualReportData,
    DeliverySummary,
    MonthlySummary,
    PopularProduct,
    ProductAnnualSummary,
    ProcessTimeSummary,
} from "./types";

/*
 This is the main function where the data will be queried, calculated, and returned for the annual report.
 */
export async function getAnnualReportData(
    year: number
): Promise<AnnualReportData> {

    const orders = await getOrdersForYear(year);
    const processRuns = await getProcessRunsForYear(year);

    return {
        year,
        deliverySummary: calculateDeliverySummary(orders),
        monthlySummaries: calculateMonthlySummaries(orders),
        popularProducts: calculatePopularProducts(orders),
        productSummaries: calculateProductSummaries(orders),
        processTimes: calculateProcessTimes(processRuns),
    };
}


/*
    This section is for the database queries to get the orders and process runs for the year
*/

async function getOrdersForYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.order.findMany({
        where: {
            deliveryDate: {
                gte: startDate,
                lt: endDate,
            },
        },

        include: {
            orderItems: {
                include: {
                    productVariant: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },

        orderBy: {
            deliveryDate: "asc",
        },
    });
}


async function getProcessRunsForYear(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    return prisma.processRun.findMany({
        where: {
            startedAt: {
                gte: startDate,
                lt: endDate,
            },
        },

        include: {
            productVariant: true,

            processTemplate: {
                include: {
                    templateSteps: true,
                },
            },

            stepExecutions: {
                include: {
                    templateStep: true,
                },
            },
        },
    });
}


/* 
    calculate the delivery summary for each product, including mail, personal, consignment, cancelled, and total deliveries
    this will be used for the delivery summary table in the report(pg. 11)
*/

function calculateDeliverySummary(
    orders: Awaited<ReturnType<typeof getOrdersForYear>>
): DeliverySummary[] {

    const deliveryMap =
        new Map<string, DeliverySummary>();

    for (const order of orders) {
        for (const item of order.orderItems) {

            const productName =
                item.productVariant.name;

            let summary =
                deliveryMap.get(productName);

            if (!summary) {
                summary = {
                    product: productName,
                    mail: 0,
                    personal: 0,
                    consignment: 0,
                    cancelled: 0,
                    totalDeliveries: 0,
                };

                deliveryMap.set(
                    productName,
                    summary
                );
            }

            const quantity =
                Number(item.quantity);

            if (order.status === "CANCELLED") {
                summary.cancelled += quantity;
                continue;
            }

            if (order.status !== "DELIVERED") {
                continue;
            }

            switch (order.deliveryVariant) {
                case "MAIL":
                    summary.mail += quantity;
                    break;

                case "PERSONAL":
                    summary.personal += quantity;
                    break;

                case "CONSIGNMENT":
                    summary.consignment += quantity;
                    break;
            }

            summary.totalDeliveries += quantity;
        }
    }

    return Array.from(deliveryMap.values());
}


/* 
    This section will caluclate the monthy summaries, including the top 4 products for each month, and their rank, name, and units sold
    this will be used for the monthly summaries table in the report(pg. 2-5)
*/

function calculateMonthlySummaries(
    orders: Awaited<ReturnType<typeof getOrdersForYear>>
): MonthlySummary[] {

    const monthlySummaries: MonthlySummary[] = [];

    for (let month = 0; month < 12; month++) {

        const productMap =
            new Map<string, number>();

        const monthlyOrders = orders.filter(
            (order) =>
                order.deliveryDate.getMonth() === month
        );

        for (const order of monthlyOrders) {

            if (order.status !== "DELIVERED") {
                continue;
            }

            for (const item of order.orderItems) {

                const productName =
                    item.productVariant.name;

                const quantity =
                    Number(item.quantity);

                const currentQuantity =
                    productMap.get(productName) ?? 0;

                productMap.set(
                    productName,
                    currentQuantity + quantity
                );
            }
        }

        const products =
            Array.from(productMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(
                    ([product, unitsSold], index) => ({
                        rank: index + 1,
                        product,
                        unitsSold,
                    })
                );

        monthlySummaries.push({
            month: month + 1,
            products,
        });
    }

    return monthlySummaries;
}


/* 
    This section will calculate the most popular products for the year, including their rank, name, and units sold
    this will be used for the popular products table in the report(pg. 2)
*/

function calculatePopularProducts(
    orders: Awaited<ReturnType<typeof getOrdersForYear>>
): PopularProduct[] {

    const annualProductMap =
        new Map<string, number>();

    for (const order of orders) {

        if (order.status !== "DELIVERED") {
            continue;
        }

        for (const item of order.orderItems) {

            const productName =
                item.productVariant.name;

            const quantity =
                Number(item.quantity);

            const currentQuantity =
                annualProductMap.get(productName) ?? 0;

            annualProductMap.set(
                productName,
                currentQuantity + quantity
            );
        }
    }

    return Array.from(annualProductMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 14)
        .map(([product, unitsSold], index) => ({
            rank: index + 1,
            product,
            unitsSold,
        }));
}


/* 
    This section will calculate the product summaries for the year, including the total units sold, variants, and the four most popular months for each product
    this will be used for the product summaries table in the report(pg. 6-10)
*/

function calculateProductSummaries(
    orders: Awaited<ReturnType<typeof getOrdersForYear>>
): ProductAnnualSummary[] {

    const productSummaryMap =
        new Map<string, ProductAnnualSummary>();

    // Build product/presentation totals.
    for (const order of orders) {

        if (order.status !== "DELIVERED") {
            continue;
        }

        for (const item of order.orderItems) {

            const productName =
                item.productVariant.name;

            const presentation =
                item.productVariant.presentation ?? "N/A";

            const quantity =
                Number(item.quantity);

            let productSummary =
                productSummaryMap.get(productName);

            if (!productSummary) {
                productSummary = {
                    product: productName,
                    variants: [],
                    totalUnitsSold: 0,
                    popularMonths: [],
                };

                productSummaryMap.set(
                    productName,
                    productSummary
                );
            }

            let variantSummary =
                productSummary.variants.find(
                    (variant) =>
                        variant.presentation === presentation
                );

            if (!variantSummary) {
                variantSummary = {
                    presentation,
                    unitsSold: 0,
                };

                productSummary.variants.push(
                    variantSummary
                );
            }

            variantSummary.unitsSold += quantity;
            productSummary.totalUnitsSold += quantity;
        }
    }

    // Find the four most popular months for each product.
    for (const productSummary of productSummaryMap.values()) {

        const monthTotals =
            new Map<number, number>();

        for (const order of orders) {

            if (order.status !== "DELIVERED") {
                continue;
            }

            for (const item of order.orderItems) {

                if (
                    item.productVariant.name !==
                    productSummary.product
                ) {
                    continue;
                }

                const month =
                    order.deliveryDate.getMonth() + 1;

                const quantity =
                    Number(item.quantity);

                const currentTotal =
                    monthTotals.get(month) ?? 0;

                monthTotals.set(
                    month,
                    currentTotal + quantity
                );
            }
        }

        productSummary.popularMonths =
            Array.from(monthTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([month]) => month);
    }

    return Array.from(productSummaryMap.values());
}


/* 
    THis section is for the process times, including the expected time, actual time, and percentage of time for each process
    this will be used for the "Tiempo muerto por proceso" table in the report(pg. 10)
*/

function calculateProcessTimes(
    processRuns: Awaited<
        ReturnType<typeof getProcessRunsForYear>
    >
): ProcessTimeSummary[] {

    const processTimes: ProcessTimeSummary[] = [];

    for (const run of processRuns) {

        let expectedMinutes = 0;
        let actualMinutes = 0;

        for (
            const step of
            run.processTemplate.templateSteps
        ) {
            expectedMinutes +=
                step.idealDurationMin ?? 0;
        }

        for (const execution of run.stepExecutions) {
            actualMinutes +=
                execution.actualDurationMin ?? 0;
        }

        const timePercent =
            expectedMinutes > 0
                ? (actualMinutes / expectedMinutes) * 100
                : 0;

        processTimes.push({
            process: run.productVariant.name,
            expectedMinutes,
            actualMinutes,

            timePercent:
                Math.round(timePercent * 100) / 100,
        });
    }

    return processTimes;
}