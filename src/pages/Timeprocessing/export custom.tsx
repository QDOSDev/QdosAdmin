import { Modal, DatePicker, message } from "antd";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
import axios from "axios";
import Cookies from "js-cookie";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useState } from "react";

const { RangePicker } = DatePicker;

const ExportModal = (props: { open: boolean; onClose: () => void }) => {
  const { open, onClose } = props;
  const endpoint = import.meta.env.VITE_API_LIVEHOST;
  const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
  const token = Cookies.get("token") || "";

  const [selectedDates, setSelectedDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const fetchTimeProcessing = async (start: Date, end: Date) => {
    try {
      const startDate = formatDate(start);
      const endDate = formatDate(end);

      const queryParams = new URLSearchParams();
      queryParams.append("filter[BETWEENshift_date]", `${startDate},${endDate}`);

      const url = `${endpoint}?route=Time/Processing/list&${queryParams.toString()}`;

      const { data } = await axios.get(url, {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.status) {
        return data.data;
      } else {
        throw new Error("Failed to fetch time processing data.");
      }
    } catch (error) {
      console.error("Error fetching time processing data:", error);
      throw error;
    }
  };

  const exportToExcel = async (data: any[], start: Date, end: Date) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Time Processing");

    const dateList: string[] = [];
    let current = dayjs(start).startOf("day");
    const finalDate = dayjs(end).startOf("day");

    while (current.isSameOrBefore(finalDate)) {
      dateList.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    const formattedDateList = dateList.map((d) => dayjs(d).format("DD MMM"));
    const customerNames = Array.from(new Set(data.map((d) => d.Customer_Name)));

    const title = `1. ${dayjs(start).format("YYYY DD MMM")}-${dayjs(end).format("DD MMM YYYY")}`;
    worksheet.mergeCells(1, 1, 1, formattedDateList.length + 2);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.font = { bold: true };
    worksheet.getRow(1).height = 30;

    worksheet.getRow(2).values = ["Customer Name", ...formattedDateList, "Total Hours"];
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    customerNames.forEach((customer) => {
      const rowValues: (string | number)[] = [customer];
      let totalHours = 0;

      dateList.forEach((dateStr) => {
        const entry = data.find(
          (d) => d.Customer_Name === customer && d.shift_date === dateStr
        );
        const hours = entry ? Number(entry.total_hours || 0) : 0;
        rowValues.push(hours ? hours.toFixed(2) : "");
        totalHours += hours;
      });

      rowValues.push(totalHours.toFixed(2));
      worksheet.addRow(rowValues);
    });

    worksheet.addRow([]);

    const payRow: (string | number)[] = ["Total Pay"];
    dateList.forEach((dateStr) => {
      let total = 0;
      customerNames.forEach((customer) => {
        const entry = data.find(
          (d) => d.Customer_Name === customer && d.shift_date === dateStr
        );
        total += entry ? Number(entry.total_pay || 0) : 0;
      });
      payRow.push(`$${total.toFixed(2)}`);
    });

    const grandTotalPay = data.reduce((sum, d) => sum + Number(d.total_pay || 0), 0);
    payRow.push(`$${grandTotalPay.toFixed(2)}`);
    const totalPayRow = worksheet.addRow(payRow);

    totalPayRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE599" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    worksheet.getColumn(1).width = 24;
    for (let i = 2; i <= formattedDateList.length + 2; i++) {
      worksheet.getColumn(i).width = 10;
    }

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `TimeProcessing_${Date.now()}.xlsx`);
  };

  const handleExport = async () => {
    if (selectedDates && selectedDates[0] && selectedDates[1]) {
      setLoading(true);
      const [start, end] = selectedDates;
      const startDate = start.toDate();
      const endDate = end.toDate();

      try {
        const response = await fetchTimeProcessing(startDate, endDate);
        if (response) {
          await exportToExcel(response, startDate, endDate);
          message.success("Exported successfully!");
          onClose();
        }
      } catch (error) {
        message.error("Export failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      message.warning("Please select a date range first.");
    }
  };

  return (
    <Modal
      title="Export Custom Fields"
      open={open}
      onOk={handleExport}
      onCancel={onClose}
      okText="Export"
      confirmLoading={loading}
      okButtonProps={{
        style: {
          backgroundColor: "rgb(234, 179, 8)", 
          borderColor: "#fadb14",
          color: "white",
          fontWeight: "bold",
        },
      }}
    >
      <p className="mb-2">Select date range to export (Year / Month / Day):</p>
      <RangePicker
        format="YYYY-MM-DD"
        onChange={setSelectedDates}
        style={{ width: "100%" }}
        picker="date"
      />
    </Modal>
  );
};

export default ExportModal;
