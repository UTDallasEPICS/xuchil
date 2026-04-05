"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Excel;
//convert work hours to an excel sheet
var XLSX = require("xlsx");
function Excel(input, wage) {
    var workbook = XLSX.utils.book_new(); //excel file
    var dates = input.map(function (item) { return new Date(item.date); });
    var minDate = new Date(Math.min.apply(Math, dates.map(function (d) { return d.getTime(); })));
    var maxDate = new Date(Math.max.apply(Math, dates.map(function (d) { return d.getTime(); })));
    var summaryRows = [
        ["Team Name", "Equipo Xuchil"],
        ["fecha", "".concat(minDate.toLocaleDateString(), " - ").concat(maxDate.toLocaleDateString())],
        ["Tarifa por hora", wage],
        []
    ];
    var worksheet = XLSX.utils.aoa_to_sheet(summaryRows); //excel sheet
    var tableData = input.map(function (item) { return ({
        name: item.name,
        date: new Date(item.date).toLocaleDateString(),
        start_time: item.start_time,
        end_time: item.end_time,
        total_hours: item.total_hours,
        total_pay: item.total_hours * wage,
        task_name: item.task_name,
    }); });
    XLSX.utils.sheet_add_json(worksheet, tableData, {
        origin: "A5",
        skipHeader: false,
    });
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Info"); //
    // calculate totals
    var totalHours = input.reduce(function (sum, item) { return sum + item.total_hours; }, 0);
    var totalPay = totalHours * wage;
    // find where table ends
    var startRow = 5; // where your table starts
    var endRow = startRow + input.length + 1; // where hours row
    // add totals at bottom
    XLSX.utils.sheet_add_aoa(worksheet, [
        ["Total hours", totalHours],
        ["Total pay", totalPay],
    ], { origin: "A".concat(endRow + 1) });
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
], 30);
