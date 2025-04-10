import React from "react";
import styles from "@/styles/DynamicTable.module.css";

interface TableColumn {
    key: string;
    label: string;
    isButton?: boolean;
  }
  
  interface TableRow {
    [key: string]: string | { text: string; onClick: () => void };
  }
  
  interface DynamicTableProps {
    columns: TableColumn[];
    data: TableRow[];
  }
  
  const DynamicTable: React.FC<DynamicTableProps> = ({ columns, data }) => {
    return (
      <div className={styles.tableContainer}>
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
                  <td key={col.key} className={col.isButton ? styles.buttonCell : ""}>
                    {col.isButton && typeof row[col.key] === "object" ? (
                      <button className={styles.button} onClick={(row[col.key] as { onClick: () => void }).onClick}>
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
      </div>
    );
  };
  
  export default DynamicTable;