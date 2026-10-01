//import functions from pdf-lib
import {
    PDFDocument,
    PDFPage,
    PDFFont,
    StandardFonts,
    rgb,
} from "pdf-lib";

//import the types for the report data
import { AnnualReportData } from "./types";


// define constants for page elements
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

const MARGIN = 50;
const ROW_HEIGHT = 30;

// add the month names in Spanish for monthly summaries and popular months
const MONTH_NAMES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
];

//define types for PDF and table drawing

type PdfContext = {
    pdfDoc: PDFDocument;
    page: PDFPage;
    font: PDFFont;
    boldFont: PDFFont;
    y: number;
};

type TableColumn = {
    title: string;
    width: number;
};

type TableResult = {
    y: number;
};



//this is the main function that generates the annual report PDF
export async function generateAnnualReportPdf(
    data: AnnualReportData
): Promise<Uint8Array> {

    const pdfDoc = await PDFDocument.create();

    const font = await pdfDoc.embedFont(
        StandardFonts.Helvetica
    );

    const boldFont = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold
    );

    const page = pdfDoc.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
    ]);

    const context: PdfContext = {
        pdfDoc,
        page,
        font,
        boldFont,
        y: PAGE_HEIGHT - MARGIN,
    };

    context.y = drawReportTitle(
        context.page,
        context.boldFont,
        data.year,
        context.y
    );

    context.y -= 20;

    context.y = drawSectionTitle(
        context.page,
        context.boldFont,
        "Productos mas populares",
        context.y
    );

    //this section generates the popular products table

    context.y -= 10;

    // this makes sure the table fits on the page, otherwise it adds a new page

    ensureSpace(
        context,
        getTableHeight(
            data.popularProducts.length
        )
    );

    const popularTable =
        drawPopularProductsTable(
            context.page,
            context.font,
            context.boldFont,
            data,
            context.y
        );

    context.y = popularTable.y;

    context.y -= 30;

    //this section generates the monthly summaries tables

    ensureSpace(
        context,
        50
    );

    context.y = drawSectionTitle(
        context.page,
        context.boldFont,
        "Resumen por mes",
        context.y
    );

    context.y -= 15;

    drawMonthlySummaries(
        context,
        data
    );

    //this section generates the product summaries tables

    context.y -= 20;

    ensureSpace(
        context,
        50
    );

    context.y = drawSectionTitle(
        context.page,
        context.boldFont,
        "Resumen anual por producto",
        context.y
    );

    context.y -= 15;

    drawProductSummaries(
        context,
        data
    );

    //this section generates the process times table

    context.y -= 20;

    ensureSpace(
        context,
        50
    );

    context.y = drawSectionTitle(
        context.page,
        context.boldFont,
        "Tiempo muerto por proceso",
        context.y
    );

    context.y -= 15;

    drawProcessTimes(
        context,
        data
    );

    //this section generates the delivery summary table

    context.y -= 30;

    ensureSpace(
        context,
        50
    );

    context.y = drawSectionTitle(
        context.page,
        context.boldFont,
        "Estado de entregas anuales",
        context.y
    );

    context.y -= 15;

    drawDeliverySummary(
        context,
        data
    );

    addPageNumbers(
        pdfDoc,
        font
    );


    return pdfDoc.save();
}


/*
All of these functions are helpers for drawing the PDF(new page, checking space, drawing tables, adding page numbers)
*/

function addNewPage(
    context: PdfContext
): void {

    context.page = context.pdfDoc.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
    ]);

    context.y = PAGE_HEIGHT - MARGIN;
}


function ensureSpace(
    context: PdfContext,
    requiredHeight: number
): void {

    if (
        context.y - requiredHeight <
        MARGIN
    ) {
        addNewPage(context);
    }
}


function getTableHeight(
    rowCount: number
): number {
    // make sure there is an extra row for the header
    const dataRows =
        //if there is no data there is still a row for the message
        rowCount === 0 ? 1 : rowCount;

    return (dataRows + 1) * ROW_HEIGHT;
}

function addPageNumbers(
    pdfDoc: PDFDocument,
    font: PDFFont
): void {

    const pages = pdfDoc.getPages();
    const totalPages = pages.length;

    pages.forEach((page, index) => {

        const pageNumber =
            `Pagina ${index + 1} de ${totalPages}`;

        const fontSize = 9;

        const textWidth =
            font.widthOfTextAtSize(
                pageNumber,
                fontSize
            );

        page.drawText(pageNumber, {
            x: (PAGE_WIDTH - textWidth) / 2,
            y: 20,
            size: fontSize,
            font,
        });
    });
}


/*
This section is for the titles, headings, and sections of the report
*/

function drawReportTitle(
    page: PDFPage,
    boldFont: PDFFont,
    year: number,
    y: number
): number {

    page.drawText(`Reporte Anual ${year}`, {
        x: MARGIN,
        y,
        size: 22,
        font: boldFont,
    });

    return y - 30;
}


function drawSectionTitle(
    page: PDFPage,
    boldFont: PDFFont,
    title: string,
    y: number
): number {

    page.drawText(title, {
        x: MARGIN,
        y,
        size: 16,
        font: boldFont,
    });

    return y - 20;
}


/*
This section is for the specific tables in the report, such as popular products, 
monthly summaries, product summaries, process times, and delivery summary
*/

function drawPopularProductsTable(
    page: PDFPage,
    font: PDFFont,
    boldFont: PDFFont,
    data: AnnualReportData,
    startY: number
): TableResult {

    const columns: TableColumn[] = [
        { title: "Rango", width: 50 },
        { title: "Producto", width: 180 },
        { title: "Unidades vendidas/utilizadas", width: 90 },
        { title: "Ganancia", width: 90 },
        { title: "Gasto", width: 90 },
    ];

    const rows = data.popularProducts.map(
        (product) => [
            product.rank.toString(),
            product.product,
            product.unitsSold.toString(),
            "-",
            "-",
        ]
    );

    return drawTable(
        page,
        font,
        boldFont,
        columns,
        rows,
        startY,
        "No hay productos registrados"
    );
}

function drawMonthlySummaries(
    context: PdfContext,
    data: AnnualReportData
): void {

    for (const monthlySummary of data.monthlySummaries) {

        const monthName =
            MONTH_NAMES[monthlySummary.month - 1];

        //Spacing for the header, the table, and after the table

        const requiredHeight =
            30 +
            getTableHeight(
                monthlySummary.products.length
            ) +
            20;

        ensureSpace(
            context,
            requiredHeight
        );

        // Month title
        context.y = drawSectionTitle(
            context.page,
            context.boldFont,
            monthName,
            context.y
        );

        context.y -= 5;

        const columns: TableColumn[] = [
            {
                title: "Rango",
                width: 60,
            },
            {
                title: "Producto",
                width: 280,
            },
            {
                title: "Unidades vendidas",
                width: 160,
            },
        ];

        const rows =
            monthlySummary.products.map(
                (product) => [
                    product.rank.toString(),
                    product.product,
                    product.unitsSold.toString(),
                ]
            );

        const table = drawTable(
            context.page,
            context.font,
            context.boldFont,
            columns,
            rows,
            context.y
        );

        context.y = table.y - 20;
    }
}

function drawProductSummaries(
    context: PdfContext,
    data: AnnualReportData
): void {

    for (const product of data.productSummaries) {

        const requiredHeight =
            30 +
            getTableHeight(product.variants.length) +
            45;

        ensureSpace(
            context,
            requiredHeight
        );

        // Product name
        context.y = drawSectionTitle(
            context.page,
            context.boldFont,
            product.product,
            context.y
        );

        context.y -= 5;

        const columns: TableColumn[] = [
            {
                title: "Presentacion",
                width: 250,
            },
            {
                title: "Unidades vendidas",
                width: 250,
            },
        ];

        const rows = product.variants.map(
            (variant) => [
                variant.presentation,
                variant.unitsSold.toString(),
            ]
        );

        const table = drawTable(
            context.page,
            context.font,
            context.boldFont,
            columns,
            rows,
            context.y
        );

        context.y = table.y - 15;

        // Total units
        context.page.drawText(
            `Total de unidades: ${product.totalUnitsSold}`,
            {
                x: MARGIN,
                y: context.y,
                size: 10,
                font: context.boldFont,
            }
        );

        context.y -= 18;

        // Four most popular months
        const popularMonths =
            product.popularMonths
                .map(getMonthName)
                .join(", ");

        context.page.drawText(
            `Meses mas populares: ${
                popularMonths || "-"
            }`,
            {
                x: MARGIN,
                y: context.y,
                size: 10,
                font: context.font,
            }
        );

        context.y -= 30;
    }
}

function drawProcessTimes(
    context: PdfContext,
    data: AnnualReportData
): void {

    const columns: TableColumn[] = [
        {
            title: "Proceso",
            width: 200,
        },
        {
            title: "Tiempo dedicado",
            width: 100,
        },
        {
            title: "Tiempo gastado",
            width: 100,
        },
        {
            title: "% de tiempo gastado",
            width: 100,
        },
    ];

    const rows = data.processTimes.map(
        (process) => [
            process.process,
            `${process.expectedMinutes} min`,
            `${process.actualMinutes} min`,
            `${process.timePercent}%`,
        ]
    );

    ensureSpace(
        context,
        getTableHeight(rows.length)
    );

    const table = drawTable(
        context.page,
        context.font,
        context.boldFont,
        columns,
        rows,
        context.y,
        "No hay procesos registrados"
    );

    context.y = table.y;
}

function drawDeliverySummary(
    context: PdfContext,
    data: AnnualReportData
): void {

    const columns: TableColumn[] = [
        {
            title: "Producto",
            width: 180,
        },
        {
            title: "Por correo",
            width: 65,
        },
        {
            title: "Personal",
            width: 65,
        },
        {
            title: "Por entrega",
            width: 65,
        },
        {
            title: "Cancelado",
            width: 65,
        },
        {
            title: "Entregas totales",
            width: 60,
        },
    ];

    const rows = data.deliverySummary.map(
        (product) => [
            product.product,
            product.mail.toString(),
            product.personal.toString(),
            product.consignment.toString(),
            product.cancelled.toString(),
            product.totalDeliveries.toString(),
        ]
    );

    ensureSpace(
        context,
        getTableHeight(rows.length)
    );

    const table = drawTable(
        context.page,
        context.font,
        context.boldFont,
        columns,
        rows,
        context.y,
        "No hay entregas registradas"
    );

    context.y = table.y;
}

/*
    This section is for helper more helper functions used in the report generation, such as wrapping text, drawing tables, and drawing cells
*/

function getMonthName(month: number): string {
    return MONTH_NAMES[month - 1] ?? "";
}

function wrapText(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number
): string[] {

    const words = text.split(" ");
    const lines: string[] = [];

    let currentLine = "";

    for (const word of words) {
        const testLine =
            currentLine.length === 0
                ? word
                : `${currentLine} ${word}`;

        const width =
            font.widthOfTextAtSize(
                testLine,
                fontSize
            );

        if (width <= maxWidth) {
            currentLine = testLine;
        } else {
            if (currentLine.length > 0) {
                lines.push(currentLine);
            }

            currentLine = word;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

function drawTable(
    page: PDFPage,
    font: PDFFont,
    boldFont: PDFFont,
    columns: TableColumn[],
    rows: string[][],
    startY: number,
    emptyMessage?: string
): TableResult {

    let y = startY;
    let x = MARGIN;

    // Header row
    for (const column of columns) {

        drawCell(
            page,
            column.title,
            x,
            y,
            column.width,
            ROW_HEIGHT,
            boldFont
        );

        x += column.width;
    }

    y -= ROW_HEIGHT;

    if (rows.length === 0 && emptyMessage) {

    const totalWidth =
        columns.reduce(
            (sum, column) =>
                sum + column.width,
            0
        );

    drawCell(
        page,
        emptyMessage,
        MARGIN,
        y,
        totalWidth,
        ROW_HEIGHT,
        font
    );

    y -= ROW_HEIGHT;

    return { y };
    }

    // Data rows
    for (const row of rows) {

        x = MARGIN;

        for (let i = 0; i < columns.length; i++) {

            drawCell(
                page,
                row[i] ?? "",
                x,
                y,
                columns[i].width,
                ROW_HEIGHT,
                font
            );

            x += columns[i].width;
        }

        y -= ROW_HEIGHT;
    }

    return { y };
}


function drawCell(
    page: PDFPage,
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    font: PDFFont
): void {

    const fontSize = 9;
    const padding = 5;
    const lineHeight = 10;

    page.drawRectangle({
        x,
        y: y - height,
        width,
        height,
        borderWidth: 1,
        borderColor: rgb(0, 0, 0),
    });

    const lines = wrapText(
        text,
        font,
        fontSize,
        width - padding * 2
    );

    let textY = y - 11;

    for (const line of lines) {

        page.drawText(line, {
            x: x + padding,
            y: textY,
            size: fontSize,
            font,
        });

        textY -= lineHeight;
    }
}