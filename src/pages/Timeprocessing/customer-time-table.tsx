 import React, { useMemo } from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, Clock, Save } from "lucide-react"
import "./customer-table.css"
import type { AppDispatch, IRootState } from "../../store"
import { useDispatch } from "react-redux"
import Cookies from "js-cookie"
import { useSelector } from "react-redux"
import Loader from "../../components/Loader"
import axios from "axios"
import { Button, message, Modal, Skeleton } from "antd"
import Filter from "./filter"
import Papa from "papaparse"
import saveAs from "file-saver"
import { RxCross2 } from "react-icons/rx"
import CustomDatePicker from "./custom-datepicker"
import ExcelJS from "exceljs";
import ExportModal from "./export custom"
import Tableempty from "../Tableempty"

export default function CustomerTimeTable() {
  const getCurrentWeekRange = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const start = new Date(today)
    start.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    const end = new Date(start)
    end.setDate(start.getDate() + 6)

    return { start, end }
  }
  const [selectedRange, setSelectedRange] = React.useState<{ start: Date; end: Date }>(getCurrentWeekRange())
  const [loading, setLoading] = useState(false)

  const dispatch: AppDispatch = useDispatch()
  const [filters, setFilters] = useState({
    customer_id: "",
    site_id: "",
    service_id: "",
    BETWEENshift_date: "",
    "Guard_Schedule.guard_id": ""
  })


  const [appliedFilters, setAppliedFilters] = useState(filters)
  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const apiKey = import.meta.env.VITE_API_X_HEADER_KEY
  const token = Cookies.get("token") || ""
  const { timeprocessing }: any = useSelector((state: IRootState) => state.customerConfig)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     await dispatch(
  //       fetchtimeprocessing({
  //         start: selectedRange.start,
  //         end: selectedRange.end,
  //         filters: filters,
  //       })
  //     );
  //     setLoading(false);
  //   };

  //   fetchData();
  // }, [appliedFilters, dispatch, selectedRange]);


  const [grandTotal, setGrandTotal] = useState({
    shifts: 0,
    hours: "0 hr 0 min",
    stdHours: "0 hr 0 min",
  })

  const tableRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   if (!Array.isArray(timeprocessing)) return

  //   const totalShifts = timeprocessing.length

  //   const totalMinutes = timeprocessing.reduce((acc: number, shift: any) => {
  //     const { Clock_in, Clock_out } = shift

  //     if (Clock_in && Clock_out) {
  //       const [startHours, startMinutes, startSeconds] = Clock_in.split(":").map(Number)
  //       const [endHours, endMinutes, endSeconds] = Clock_out.split(":").map(Number)

  //       const startTotalMinutes = startHours * 60 + startMinutes
  //       let endTotalMinutes = endHours * 60 + endMinutes

  //       if (endTotalMinutes < startTotalMinutes) {
  //         endTotalMinutes += 24 * 60
  //       }

  //       const shiftMinutes = endTotalMinutes - startTotalMinutes
  //       return acc + shiftMinutes
  //     }
  //     return acc
  //   }, 0)

  //   const totalHours = Math.floor(totalMinutes / 60)
  //   const remainingMinutes = totalMinutes % 60

  //   setGrandTotal({
  //     shifts: totalShifts,
  //     hours: `${totalHours} hr ${remainingMinutes} min`,
  //     stdHours: `${totalHours + 30} hr ${remainingMinutes} min`,
  //   })
  // }, [timeprocessing])



  const groupedData = useMemo(() => {
    const data: Record<string, Record<string, any[]>> = {};
    timeprocessing.forEach((shift: any) => {
      if (!data[shift.Customer_Name]) data[shift.Customer_Name] = {};
      if (!data[shift.Customer_Name][shift.Site_Name]) data[shift.Customer_Name][shift.Site_Name] = [];
      data[shift.Customer_Name][shift.Site_Name].push(shift);
    });
    return data;
  }, [timeprocessing]);




  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
    setAppliedFilters(newFilters)
  }

  const handleStyledExcelExport = async () => {
    setDropdownOpen(false);
    if (timeprocessing.length === 0) {
      message.warning("No data available for export.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Guard Shifts");

    const columns = [
      "Shift date",
      "Site name",
      "Service description",
      "Scheduled shift start",
      "Scheduled shift end",
      "Check-in time",
      "Check-out time",
      "Total Pay hrs",
    ];
    const colCount = columns.length;

    const grouped = timeprocessing.reduce((acc: any, entry: any) => {
      const guard = entry.Customer_Name || "Unknown";
      if (!acc[guard]) acc[guard] = [];
      acc[guard].push(entry);
      return acc;
    }, {});

    Object.entries(grouped).forEach(([guardName, shifts]: any[], guardIndex) => {

      const nameRow = worksheet.addRow([guardName]);
      worksheet.mergeCells(nameRow.number, 1, nameRow.number, colCount);
      nameRow.font = { bold: true, size: 13 };
      nameRow.alignment = { vertical: "middle", horizontal: "left" };
      nameRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" },
      };

      const headerRow = worksheet.addRow(columns);
      headerRow.font = { bold: true, size: 12 };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" },
      };
      headerRow.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      let totalMinutes = 0;

      shifts.forEach((entry: any) => {
        const {
          shift_date,
          Site_Name,
          Service_Name,
          schedule_start,
          schedule_end,
          Clock_in,
          Clock_out,
        } = entry;

        const start = new Date(`1970-01-01T${Clock_in}`);
        const end = new Date(`1970-01-01T${Clock_out}`);
        let diffMin = (end.getTime() - start.getTime()) / (1000 * 60);
        if (diffMin < 0) diffMin += 24 * 60;
        totalMinutes += diffMin;

        const hours = Math.floor(diffMin / 60);
        const minutes = diffMin % 60;
        const duration = minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;

        const row = worksheet.addRow([
          shift_date,
          Site_Name,
          Service_Name,
          schedule_start || "---",
          schedule_end || "---",
          Clock_in,
          Clock_out,
          duration,
        ]);

        row.alignment = { vertical: "middle", horizontal: "center" };
        row.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Total Row
      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = totalMinutes % 60;
      const totalTimeStr =
        totalMins > 0
          ? `Total: ${totalHours} hr ${totalMins} min`
          : `Total: ${totalHours} hr`;

      const totalRow = worksheet.addRow([totalTimeStr]);
      worksheet.mergeCells(totalRow.number, 1, totalRow.number, colCount);
      totalRow.font = { bold: true };
      totalRow.alignment = { horizontal: "left" };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" },
      };

      worksheet.addRow([]);
    });

    // Auto-size columns
    worksheet.columns.forEach((col: any) => {
      let maxLen = 0;
      col.eachCell?.((cell: any) => {
        const len = cell?.value?.toString().length || 10;
        if (len > maxLen) maxLen = len;
      });
      col.width = maxLen + 5;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Styled_Guard_Shifts_${new Date().toISOString()}.xlsx`
    );
  };

  const [editedShifts, setEditedShifts] = useState<Record<string, { clockin: string; clockout: string }>>({})

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // Process all edited shifts sequentially
      for (const [shiftId, times] of Object.entries(editedShifts)) {
        await handleSubmit(shiftId);
      }
    } catch (error) {
      message.error("Failed to save some changes");
    } finally {
      setLoading(false);
    }
  };

  const calculateShiftTotal = (shift: any) => {
    if (!shift.Clock_in && !shift.Clock_out) return "—"
    const start = shift.Clock_in || shift.schedule_start
    const end = shift.Clock_out || shift.schedule_end

    if (!start || !end) return "—"

    const [startHours, startMinutes] = start.split(":").map(Number)
    const [endHours, endMinutes] = end.split(":").map(Number)

    const startTotalMinutes = startHours * 60 + startMinutes
    let endTotalMinutes = endHours * 60 + endMinutes

    if (endTotalMinutes < startTotalMinutes) {
      endTotalMinutes += 24 * 60
    }

    const totalMinutes = endTotalMinutes - startTotalMinutes
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${hours} hr ${minutes} min`
  }

  const { allcustomers, services, site, gaurds }: any = useSelector((state: IRootState) => state.customerConfig)

  // useEffect(() => {
  //   dispatch(fetchServices())
  //   dispatch(fetchAllCustomers())
  //   dispatch(fetchGaurd())
  // }, [dispatch])
  const getDisplayValue = (key: any, value: any) => {
    if (key === "customer_id") {
      const customer = allcustomers.find((c: { id: string; customer_name: string }) => c.id == value)
      return customer ? customer.customer_name : value
    } else if (key === "site_id") {
      const selectedSite = site.find((s: { ID: string; site_name: string }) => s.ID == value)
      return selectedSite ? selectedSite.site_name : value
    } else if (key === "service_id") {
      const selectedService = services.find((s: { ID: string; Service_name: string }) => s.ID == value)
      return selectedService ? selectedService.Service_name : value
    }else if (key === "Guard_Schedule.guard_id") {
      const selectedGuard = gaurds.find((s: { ID: string; first_name: string; last_name: string }) => s.ID == value);
      return selectedGuard ? `${selectedGuard.first_name} ${selectedGuard.last_name}` : value;
    }
    
    return value
  }

  const handleSubmit = async (ID: string) => {
    if (!editedShifts[ID]) return;

    const shift = timeprocessing.find((s: any) => s.ShiftID === ID);
    if (!shift) return;

    const clockin = editedShifts[ID].clockin ?? shift.Clock_in;
    const clockout = editedShifts[ID].clockout ?? shift.Clock_out;

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${endpoint}?route=Clock/IN-OUT/Update&ID=${ID}`,
        { clockin, clockout },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.status === true) {
        message.success("Clock In/Out Updated Successfully!");
       

        setEditedShifts((prev) => {
          const newState = { ...prev };
          delete newState[ID];
          return newState;
        });
      }
    } catch (error) {
      message.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const removeFilter = (key: string) => {
    const updatedFilters = { ...appliedFilters, [key]: "" }
    setFilters(updatedFilters)
    setAppliedFilters(updatedFilters)
  }
 
  

  const generateDays = (start: Date, end: Date) => {
    const days = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const tempDate = new Date(currentDate)

      days.push({
        day: tempDate.toLocaleString("en-US", { weekday: "short" }),
        vailddate:
          tempDate.getFullYear() +
          "-" +
          String(tempDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          String(tempDate.getDate()).padStart(2, "0"),
        date: tempDate.toLocaleString("en-US", { month: "short", day: "numeric" }),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }
  const [days, setdays] = useState<any[]>([])
  // useEffect(() => {

  //   setdays(generateDays(selectedRange.start, selectedRange.end))
  //   dispatch(
  //     fetchtimeprocessing({
  //       start: selectedRange.start,
  //       end: selectedRange.end,
  //       filters: filters,
  //     }),
  //   )
  // }, [selectedRange])

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<{
    Clock_in?: string
    Clock_out?: string
    [key: string]: any
  } | null>(null)

  const handleShiftClick = (shift: any) => {
    setSelectedShift(shift)
    if (!editedShifts[shift.ShiftID]) {
      setEditedShifts((prev) => ({
        ...prev,
        [shift.ShiftID]: {
          clockin: shift.Clock_in || "",
          clockout: shift.Clock_out || "",
        },
      }))
    }
    setIsPopupOpen(true)
  }

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false)

  // useEffect(() => {
  //   const handleClickOutside = (event: any) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setDropdownOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  return (

    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="grid gap-1">
          <h2 className="CRM-Page-Title">Time Processing</h2>
          <p className="CRM-Page-Structure">
            Dashboard / <span className="CRM-Page-Name">Time Processing</span>
          </p>
          <div className="flex flex-wrap gap-3 items-center mt-3">
            {Object.entries(appliedFilters)
              .filter(([_, value]) => value)
              .map(([key, value]) => (
                <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
                  {getDisplayValue(key, value)} <RxCross2 />
                </Button>
              ))}

            {Object.values(appliedFilters).some((value) => value) && (
              <h5
                className="text-yellow cursor-pointer"
                onClick={() => {
                  const resetFilters = {
                    customer_id: "",
                    site_id: "",
                    service_id: "",
                    BETWEENshift_date: "",
                    "Guard_Schedule.guard_id": "",
                    
                  }
                  setFilters(resetFilters)
                  setAppliedFilters(resetFilters)
                }}
              >
                Clear all filters
              </h5>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
         
          <div className="flex items-center w-1/1.5">
            <CustomDatePicker selectedRange={selectedRange} onRangeChange={setSelectedRange} />
          </div>
          <Filter
            onFilterChange={handleFilterChange}
            allcustomers={allcustomers}
            site={site}
            gaurds={gaurds}
            services={services}
            filters={filters}
            setFilters={setFilters}
          />
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              className="btn Insert-Button gap-3"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={21}
                height={21}
                viewBox="0 0 21 21"
                fill="none"
              >
                <path
                  d="M16.4306 7.24536H13.2926V9.10731H16.4306C17.3638 9.10731 18.0878 9.58397 18.0878 9.99422V18.2507C18.0878 18.661 17.3638 19.1376 16.4306 19.1376H4.56938C3.63623 19.1376 2.91224 18.661 2.91224 18.2507V9.99453C2.91224 9.58428 3.63623 9.10762 4.56938 9.10762H7.70676V7.24567H4.56938C2.59602 7.24567 1.05029 8.45315 1.05029 9.99453V18.251C1.05029 19.7927 2.59602 20.9999 4.56938 20.9999H16.4309C18.404 20.9999 19.95 19.7924 19.95 18.251V9.99453C19.9497 8.45284 18.404 7.24536 16.4306 7.24536Z"
                  fill="white"
                />
                <path
                  d="M7.74476 4.64091C7.98309 4.64091 8.22111 4.54998 8.40296 4.36813L9.56854 3.20255V7.24547V9.10742V12.6743C9.56854 13.1885 9.98531 13.6053 10.4995 13.6053C11.0137 13.6053 11.4305 13.1885 11.4305 12.6743V9.10742V7.24547V3.13956L12.6591 4.36813C12.8409 4.54998 13.0792 4.64091 13.3173 4.64091C13.5553 4.64091 13.7936 4.54998 13.9755 4.36813C14.3392 4.00474 14.3392 3.41513 13.9755 3.05174L11.1959 0.272155C11.014 0.0903045 10.776 0 10.538 0C10.5355 0 10.5333 0 10.5309 0C10.5284 0 10.5262 0 10.5237 0C10.2857 0 10.0477 0.0903045 9.86583 0.272155L7.08625 3.05174C6.72255 3.41513 6.72255 4.00474 7.08625 4.36813C7.26841 4.54998 7.50643 4.64091 7.74476 4.64091Z"
                  fill="white"
                />
              </svg>
              <span>Export</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fade-in-up">
                <div className="py-2">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 w-full text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l-4-4m0 0l4-4m-4 4h16" />
                    </svg>
                    Export Custom Dates
                  </button>

                  <button
                    onClick={handleStyledExcelExport}
                    className="flex items-center gap-2 px-5 py-3 w-full text-left text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8v2H8V8zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
                    </svg>
                    Export Whole Data
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div
        ref={tableRef}
        className="overflow-x-auto rounded-lg shadow-sm border border-slate-200"
        style={{
          position: "relative",
          maxHeight: "80vh",
        }}
      >
        <div className="border-t-8 border-[#113354]"></div>

        <div>
          {loading ? (
            <table className="min-w-full border-collapse my-6">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 z-20 bg-slate-50 w-6 px-1 py-3.5"></th>
                  <th className="sticky left-6 z-20 bg-slate-50 w-6 px-1 py-3.5"></th>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <th key={idx} className="px-4 py-3.5">
                      <Skeleton.Input active size="small" style={{ width: "100px" }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                
                {Array.from({ length: 8 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="bg-white border-b border-slate-100">
                    <td className="sticky left-0 bg-white px-2 py-4 z-10"></td>
                    <td className="sticky left-10 bg-white px-2 py-4 z-10"></td>
                    {Array.from({ length: 10 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-4">
                        <Skeleton.Input active size="small" block />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !timeprocessing || timeprocessing.length === 0 ? (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {/* Fixed columns */}
                  <th className="sticky left-0 z-20 bg-slate-50 w-6 px-0.5 py-3.5"></th>
                  <th className="sticky left-6 z-20 bg-slate-50 w-6 px-0.5 py-3.5"></th>
                  {/* Scrollable columns header */}
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Shift Date
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Scheduled start time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Scheduled end time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Check-in time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Check-out time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Shift total
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Customer Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Site Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Service Description
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Guard Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Action
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={12} className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Tableempty length={12} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {/* Fixed columns */}
                  <th className="sticky left-0 z-20 bg-slate-50 w-6 px-0.5 py-3.5"></th>
                  <th className="sticky left-6 z-20 bg-slate-50 w-6 px-0.5 py-3.5"></th>

                  {/* Scrollable columns */}
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Shift Date
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Scheduled start time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Scheduled end time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Check-in time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Check-out time
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Shift total
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Customer Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Site Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Service Description
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Guard Name
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-2 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      Action
                      <ChevronDown className="ml-1 w-4 h-4 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {Object.entries(groupedData).map(([customer, sites]) =>
                  Object.entries(sites).map(([site, shifts]) =>
                    shifts.map((shift) => (
                      <tr key={shift.ShiftID} className="bg-slate-50/50 hover:bg-slate-100/80 transition-colors">
                        {/* Fixed columns */}
                        <td className="sticky left-0 z-10 bg-slate-50/50 px-0.5 py-3 transition-colors"></td>
                        <td className="sticky left-10 z-10 bg-slate-50/50 px-0.5 py-3 transition-colors"></td>

                        {/* Scrollable columns */}
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">{shift.shift_date}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">{shift.schedule_start}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">
                          {shift.schedule_end}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">
                          <input
                            type="time"
                            value={editedShifts[shift.ShiftID]?.clockin || shift.Clock_in || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditedShifts((prev) => ({
                                ...prev,
                                [shift.ShiftID]: {
                                  ...prev[shift.ShiftID],
                                  clockin: newValue,
                                },
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit(shift.ShiftID);
                              }
                            }}
                            className="border border-slate-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">
                          <input
                            type="time"
                            value={editedShifts[shift.ShiftID]?.clockout || shift.Clock_out || ''}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              setEditedShifts((prev) => ({
                                ...prev,
                                [shift.ShiftID]: {
                                  ...prev[shift.ShiftID],
                                  clockout: newValue,
                                },
                              }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSubmit(shift.ShiftID);
                              }
                            }}
                            className="border border-slate-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div
                              title="Edit Shift"
                              onClick={() => handleShiftClick(shift)}
                              className="text-sm font-medium text-slate-900 cursor-pointer"
                            >
                              {calculateShiftTotal(shift)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">{shift.Customer_Name}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">{shift.Site_Name}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">{shift.Service_Name}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">
                          {`${shift.Guard_First_Name} ${shift.Guard_Last_Name}`}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-sm text-slate-700">
                          <button
                            disabled={!editedShifts[shift.ShiftID] || 
                              (!editedShifts[shift.ShiftID]?.clockin && !editedShifts[shift.ShiftID]?.clockout)}
                            className={`p-1 mx-1 text-gray-500 hover:bg-gray-100 rounded-md border border-gray ${
                              !editedShifts[shift.ShiftID] || (!editedShifts[shift.ShiftID]?.clockin && !editedShifts[shift.ShiftID]?.clockout)
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:text-blue-600'
                            }`}
                            onClick={() => handleSubmit(shift.ShiftID)}
                          >
                            <Save />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                )}

                {/* Grand Total Row */}
                <tr className="bg-slate-100 font-medium border-t border-slate-300">
                  <td className="sticky left-0 z-10 bg-slate-100 px-2 py-4"></td>
                  <td className="sticky left-10 z-10 bg-slate-100 px-2 py-4 text-right">
                    <span className="text-xs font-semibold text-slate-700 uppercase">Total:</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{grandTotal.shifts} shifts</span>
                  </td>
                  <td colSpan={9}></td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{grandTotal.hours}</span>
                  </td>
                </tr>
              </tbody>

            </table>
          )}
        </div>
      </div>


      <ExportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  )
}

