"use client";

import React from "react";
import styles from "@/styles/DynamicTable.module.css";
import { useRouter } from "next/navigation";

interface TableColumn {
  key: string;
  label: string;
  isButton?: boolean;
}

interface TableRow {
  [key: string]: string | { text: string; idProceso: string };
}

interface DynamicTableProps {
  columns: TableColumn[];
  data: TableRow[];
  isAdminMode?: boolean;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  columns,
  data,
  isAdminMode = true
}) => {
  const router = useRouter();

  const handleVerClick = (
    idProceso: string,
    tarea?: string,
    isAdmin = true
  ) => {
    if (isAdmin) {
      router.push(`/detail-process?id=${idProceso}`);
    } else if (tarea) {
      router.push(`/detail-process?id=${idProceso}&actividad=${encodeURIComponent(tarea)}`);
    } else {
      console.warn("No se proporcionó la tarea para vista de usuario.");
    }
  };

  return (
    <div className={styles.tableContainer}>
      {data.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.isButton ? styles.buttonCell : ""}
                  >
                    {col.isButton && typeof row[col.key] === "object" ? (
                      <button
                        className={styles.button}
                        onClick={() => {
                          const id = (row[col.key] as { idProceso: string }).idProceso;
                          const tarea =
                            typeof row["tarea"] === "string" ? row["tarea"] : undefined;
                          handleVerClick(id, tarea, isAdminMode);
                        }}
                      >
                        {(row[col.key] as { text: string }).text}
                      </button>
                    ) : (
                      row[col.key] as string
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ width: "100%", justifyContent: "center" }}>
          <p className={styles.noResults}>
            No se encontraron resultados que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
