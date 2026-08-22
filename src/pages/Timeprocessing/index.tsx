import React from 'react'

export default function index() {
    return (
        <div>index</div>
    )
}


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchtimeprocessing } from "../../store/customerConfigSlice";
// import { AppDispatch, IRootState } from "../../store";
// import { RxCross2 } from "react-icons/rx";
// import Filter from "../guard/filter";
// import { Button, message } from "antd";
// import axios from "axios";
// import Cookies from "js-cookie";

// export default function BillingSummary() {
//     const dispatch: AppDispatch = useDispatch();

//     const endpoint = import.meta.env.VITE_API_LIVEHOST;
//     const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
//     const token = Cookies.get("token") || "";
//     const { timeprocessing } = useSelector(
//         (state: IRootState) => state.customerConfig
//     ) as { timeprocessing: Shift[] };

//     const [filters, setFilters] = useState({
//         customer_Name: "",
//         site_name: "",
//         shift_date: "",
//         Service_name: "",
//     });

//     const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

//     const [editedShifts, setEditedShifts] = useState<Record<string, { clockin: string; clockout: string }>>({});

//     useEffect(() => {
//         dispatch(fetchtimeprocessing());
//     }, [dispatch]);

//     const toggleCustomerExpand = (customer: string) => {
//         setExpandedCustomers((prev) => ({
//             ...prev,
//             [customer]: !prev[customer],
//         }));
//     };

//     const removeFilter = (key: string) => {
//         setFilters((prev) => ({ ...prev, [key]: "" }));
//     };

//     const [editingShift, setEditingShift] = useState<string | null>(null);
//     const handleInputChange = (shiftID: string, field: string, value: string) => {
//         setEditedShifts((prev) => ({
//             ...prev,
//             [shiftID]: { ...prev[shiftID], [field]: value },
//         }));
//     };


//     const handleEditClick = (shiftID: string) => {
//         setEditingShift(shiftID);
//     };

//     const handleSaveClick = (shiftID: string) => {
//         handleSubmit(shiftID);
//         setEditingShift(null);
//     };


//     const groupedData: Record<string, Record<string, any[]>> = {};
//     timeprocessing.forEach((shift: any) => {
//         if (!groupedData[shift.Customer_Name]) groupedData[shift.Customer_Name] = {};
//         if (!groupedData[shift.Customer_Name][shift.Site_Name])
//             groupedData[shift.Customer_Name][shift.Site_Name] = [];
//         groupedData[shift.Customer_Name][shift.Site_Name].push(shift);
//     });

//     const isValidTime = (time: string) => {
//         return /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time);
//     };

//     interface Shift {
//         ShiftID: string;
//         Clock_in: string;
//         Clock_out: string;
//         [key: string]: any;
//     }

//     const handleSubmit = async (ID: string) => {
//         if (!editedShifts[ID]) return;

//         const shift = timeprocessing.find((s: any) => s.ShiftID === ID);
//         if (!shift) return;


//         // Use edited value or fallback to original
//         const clockin = editedShifts[ID].clockin ?? shift.Clock_in;
//         const clockout = editedShifts[ID].clockout ?? shift.Clock_out;

//         try {
//             const { data } = await axios.post(
//                 `${endpoint}?route=Clock/IN-OUT/Update&ID=${ID}`,
//                 { clockin, clockout }, // Send both values
//                 {
//                     headers: {
//                         "x-api-key": apiKey,
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (data.status === true) {
//                 message.success("Clock In/Out Updated Successfully!");
//                 dispatch(fetchtimeprocessing());

//                 // Remove from edited shifts after saving
//                 setEditedShifts((prev) => {
//                     const newState = { ...prev };
//                     delete newState[ID];
//                     return newState;
//                 });
//             }
//         } catch (error) {
//             message.error("Something went wrong!");
//         }
//     };

//     const [loading, setLoading] = useState(false)



//     return (
//         <div className="Managepeople-Div grid gap-3">
//             {/* Header & Filters */}
//             <div className="flex flex-wrap items-center justify-between gap-3 p-4">
//                 <div className="grid gap-1">
//                     <h2 className="CRM-Page-Title">Time Processing</h2>
//                     <p className="CRM-Page-Structure">
//                         Dashboard / HRM / <span className="CRM-Page-Name">Time Processing</span>
//                     </p>
//                     <div className="flex flex-wrap gap-3 items-center mt-3">
//                         {Object.entries(filters)
//                             .filter(([key, value]) => value) // Only show non-empty filters
//                             .map(([key, value]) => (
//                                 <Button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
//                                     {value} <RxCross2 />
//                                 </Button>
//                             ))}
//                         {/* {Object.values(filters).some(value => value) && (
//                                     <h5 className="text-yellow cursor-pointer" onClick={() => setFilters({
//                                         customer_Name: '',
//                                         site_name: '',
//                                         shift_date: '',
//                                         Service_name: '',
//                                         BETWEENshift_date: '',
//                                     })}>
//                                         Clear all filters
//                                     </h5>
//                                 )} */}
//                     </div>

//                 </div>
//                 <div className="flex flex-wrap items-center justify-end gap-3">
//                     <Filter onFilterChange={setFilters} />
//                 </div>
//             </div>

//             {/* Active Filters Display */}
//             <div className="flex flex-wrap gap-3 items-center mt-3">
//                 {Object.entries(filters)
//                     .filter(([_, value]) => value)
//                     .map(([key, value]) => (
//                         <button key={key} className="yellow-color" onClick={() => removeFilter(key)}>
//                             {value} <RxCross2 />
//                         </button>
//                     ))}
//             </div>

//             {/* Shift Table */}
//             <div className="inventory-table mt-4 rounded-lg border border-gray-200 bg-white">
//                 <table className="w-full text-sm">
//                     <thead>
//                         <tr className="border-b bg-gray-50">
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Site Name</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Shift Date</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Guard Name</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Clock In</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Clock Out</th>
//                             <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={6} className="text-center py-4">
//                                     Loading...
//                                 </td>
//                             </tr>
//                         ) : (
//                             Object.entries(groupedData).map(([customer, sites]) => (
//                                 <React.Fragment key={customer}>
//                                     {/* Customer Row with Expand Toggle */}
//                                     <tr
//                                         className="bg-gray-100 font-bold cursor-pointer"
//                                         onClick={() => toggleCustomerExpand(customer)}
//                                     >
//                                         <td colSpan={7} className="p-2 border">
//                                             {expandedCustomers[customer] ? "🔽" : "▶"} {customer}
//                                         </td>
//                                     </tr>

//                                     {/* Show all sites and shifts if the customer is expanded */}
//                                     {expandedCustomers[customer] &&
//                                         Object.entries(sites).map(([site, shifts]) => (
//                                             <React.Fragment key={site}>
//                                                 {shifts.map((shift) => (
//                                                     <tr key={shift.ShiftID} className="border-b">
//                                                         <td></td>
//                                                         <td className="p-2 border">{shift.Site_Name}</td>
//                                                         <td className="p-2 border">{shift.shift_date}</td>
//                                                         <td className="p-2 border">{`${shift.Guard_First_Name} ${shift.Guard_Last_Name}`}</td>

//                                                         <td className="p-2 border">
//                                                             {editingShift === shift.ShiftID ? (
//                                                                 <input
//                                                                     type="text"
//                                                                     value={editedShifts[shift.ShiftID]?.clockin ?? shift.Clock_in ?? ""}
//                                                                     onChange={(e) => handleInputChange(shift.ShiftID, "clockin", e.target.value)}
//                                                                     className="w-full bg-transparent p-1 border border-gray-300 rounded outline-none"
//                                                                 />
//                                                             ) : (
//                                                                 <span
//                                                                     onClick={() => handleEditClick(shift.ShiftID)}
//                                                                     className="cursor-pointer"
//                                                                 >
//                                                                     {shift.Clock_in || "—"}
//                                                                 </span>
//                                                             )}
//                                                         </td>

//                                                         <td className="p-2 border">
//                                                             {editingShift === shift.ShiftID ? (
//                                                                 <input
//                                                                     type="text"
//                                                                     value={editedShifts[shift.ShiftID]?.clockout ?? shift.Clock_out ?? ""}
//                                                                     onChange={(e) => handleInputChange(shift.ShiftID, "clockout", e.target.value)}
//                                                                     className="w-full bg-transparent p-1 border border-gray-300 rounded outline-none"
//                                                                 />
//                                                             ) : (
//                                                                 <span
//                                                                     onClick={() => handleEditClick(shift.ShiftID)}
//                                                                     className="cursor-pointer"
//                                                                 >
//                                                                     {shift.Clock_out || "—"}
//                                                                 </span>
//                                                             )}
//                                                         </td>



//                                                         <td className="p-2 border">
//                                                             {editingShift === shift.ShiftID && (
//                                                                 <button
//                                                                     onClick={() => handleSaveClick(shift.ShiftID)}
//                                                                     className="bg-blue-500 text-white px-2 py-1 rounded"
//                                                                 >
//                                                                     Save
//                                                                 </button>
//                                                             )}
//                                                         </td>

//                                                     </tr>
//                                                 ))}
//                                             </React.Fragment>
//                                         ))}
//                                 </React.Fragment>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }