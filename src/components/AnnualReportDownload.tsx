"use client";

import { useState } from "react";
//add the already implemented button component
import Button from "@/components/Button";

export default function AnnualReportDownload() {
    const [year, setYear] = useState(
        new Date().getFullYear().toString()
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleDownload() {
        setError("");

        const reportYear = Number(year);
        const currentYear = new Date().getUTCFullYear();

        // Validate the year before requesting the PDF
        if (
            year.trim() === "" ||
            !Number.isInteger(reportYear) ||
            reportYear < 2000 ||
            reportYear > currentYear
        ) {
            setError(
                `Ingresa un año válido entre 2000 y ${currentYear}.`
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `/api/reports/annual/${reportYear}/pdf`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Debes iniciar sesión.");
                }

                if (response.status === 403) {
                    throw new Error(
                        "No tienes permiso para descargar este reporte."
                    );
                }

                if (response.status === 400) {
                    throw new Error("El año seleccionado no es válido.");
                }

                throw new Error(
                    "No se pudo generar el reporte. Inténtalo de nuevo."
                );
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `annual-report-${reportYear}.pdf`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocurrió un error inesperado."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <label htmlFor="report-year">
                Año del reporte
            </label>

            <input
                id="report-year"
                type="number"
                min={2000}
                max={new Date().getUTCFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />

            <Button
                onClick={handleDownload}
                disabled={loading}
            >
                {loading ? "Generando reporte..." : "Descargar PDF"}
            </Button>

            {error && (
                <p role="alert" className="text-red-600 mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}