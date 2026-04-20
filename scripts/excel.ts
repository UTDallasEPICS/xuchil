
//convert work hours to an excel sheet
import * as XLSX from "xlsx";

interface work_info {
  name: string;
  date: Date;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_pay: number;
  task_name: string;
}

export default function Excel(input: work_info[], wage: number) {
  const workbook = XLSX.utils.book_new(); //excel file

  const dates = input.map((item) => new Date(item.date));

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  const summaryRows = [ //header information
    ["Team Name", "Equipo Xuchil"],
    ["fecha", `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`],
    ["Tarifa por hora", wage],
    []
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryRows); //excel sheet

  const tableData = input.map((item) => ({ //information to go in columns
    name: item.name,
    date: new Date(item.date).toLocaleDateString(),
    start_time: item.start_time,
    end_time: item.end_time,
    total_hours: item.total_hours,
    total_pay: item.total_hours * wage,
    task_name: item.task_name,
  }));

  XLSX.utils.sheet_add_json(worksheet, tableData, { //include tableData in worksheet
    origin: "A5",
    skipHeader: false,
  });
 
  XLSX.utils.book_append_sheet(workbook, worksheet, "Work Info"); //add sheet to excel file

// calculate totals
const totalHours = input.reduce((sum, item) => sum + item.total_hours, 0);
const totalPay = totalHours * wage;

// find where table ends
const startRow = 5; // where table starts
const endRow = startRow + input.length + 1; // where hours go 

// add totals at bottom
XLSX.utils.sheet_add_aoa(worksheet, [
  ["TOTAL HOURS", totalHours],
  ["TOTAL PAY", totalPay],
], { origin: `A${endRow + 1}` });

  XLSX.writeFile(workbook, "work_info.xlsx");
}


Excel([
    {
      name: "Efrain",
      date: new Date("2026-03-20"),
      start_time: "9:00 AM",
      end_time: "1:30 PM",
      total_hours: 4.5,
      total_pay: 0,
      task_name: "Frontend UI"
    },
    {
      name: "Efrain",
      date: new Date("2026-03-21"),
      start_time: "10:00 AM",
      end_time: "3:00 PM",
      total_hours: 5,
      total_pay: 0,
      task_name: "API Integration"
    },
    {
      name: "Efrain",
      date: new Date("2026-03-22"),
      start_time: "8:30 AM",
      end_time: "12:30 PM",
      total_hours: 4,
      total_pay: 0,
      task_name: "Bug Fixing"
    },
    {
      name: "Efrain",
      date: new Date("2026-03-23"),
      start_time: "1:00 PM",
      end_time: "6:00 PM",
      total_hours: 5,
      total_pay: 0,
      task_name: "Backend Logic"
    },
    {
      name: "Efrain",
      date: new Date("2026-03-24"),
      start_time: "9:00 AM",
      end_time: "2:00 PM",
      total_hours: 5,
      total_pay: 0,
      task_name: "Database Setup"
    }
  ],30)