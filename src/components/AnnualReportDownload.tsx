"use client";

import { useState } from "react";

export default function AnnualReportDownload() {
    const currentYear = new Date().getFullYear();

    const [year, setYear] =
        useState(currentYear);

    const downloadReport = () => {
        window.location.href =
            `/api/reports/annual/${year}/pdf`;
    };

    return (
        <div>
            <h2>Reporte anual</h2>

            <div>
                <label htmlFor="report-year">
                    Año:
                </label>

                <input
                    id="report-year"
                    type="number"
                    value={year}
                    min={2000}
                    max={currentYear}
                    onChange={(event) =>
                        setYear(
                            Number(event.target.value)
                        )
                    }
                />
            </div>

            <button
                type="button"
                onClick={downloadReport}
            >
                Generar reporte anual
            </button>
        </div>
    );
}