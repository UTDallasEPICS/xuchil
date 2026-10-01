export type DeliverySummary = {
    product: string;
    mail: number;
    personal: number;
    consignment: number;
    cancelled: number;
    totalDeliveries: number;
};

export type AnnualReportData = {
    year: number;
    deliverySummary: DeliverySummary[];
    monthlySummaries: MonthlySummary[];
    popularProducts: PopularProduct[];
    productSummaries: ProductAnnualSummary[];
    processTimes: ProcessTimeSummary[];
};

export type MonthlyProductSummary = {
    rank: number;
    product: string;
    unitsSold: number;
};

export type MonthlySummary = {
    month: number;
    products: MonthlyProductSummary[];
};

export type PopularProduct = {
    rank: number;
    product: string;
    unitsSold: number;
};

export type ProductVariantSummary = {
    presentation: string;
    unitsSold: number;
};

export type ProductAnnualSummary = {
    product: string;
    variants: ProductVariantSummary[];
    totalUnitsSold: number;
    popularMonths: number[];
};

export type ProcessTimeSummary = {
    process: string;
    expectedMinutes: number;
    actualMinutes: number;
    timePercent: number;
};