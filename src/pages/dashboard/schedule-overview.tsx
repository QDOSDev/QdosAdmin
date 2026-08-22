"use client"

import { useState, useMemo } from "react"
import { Popover } from 'antd';
import dayjs from "dayjs";
import { ArrowLeft, ArrowRight } from "lucide-react";
export default function ScheduleOverview({ Responsedata, daterange }: any) {
    const maxBarHeight = 240;
    const daysToShow = 7;
    // Function to generate all dates in the selected range
    const generateDateRange = (startDate: string, endDate: string) => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const range = [];

        for (let date = start; date.isBefore(end) || date.isSame(end); date = date.add(1, 'day')) {
            range.push(date.format("YYYY-MM-DD"));
        }
        return range;
    };

    // Generate all dates in the selected range
    const allDates = useMemo(() => generateDateRange(daterange.start, daterange.end), [daterange]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const nextPage = () => {
        if (currentIndex + daysToShow < allDates.length) {
            setCurrentIndex(currentIndex + daysToShow);
        }
    };

    const prevPage = () => {
        if (currentIndex - daysToShow >= 0) {
            setCurrentIndex(currentIndex - daysToShow);
        }
    };
    // Merge backend data with all dates
    const processedDays = useMemo(() => {
        const backendDates = new Set(Responsedata?.days?.map((day: any) => day.fullDate) || []);

        return allDates.map((date) => {
            const existingData = Responsedata?.days?.find((day: any) => day.date === date);
            return existingData || {
                fullDate: date,
                dayName: dayjs(date).format("ddd"),
                shortDate: dayjs(date).format("MMM D"),
                totalHours: 0,
                totalShifts: 0,
                workedHours: 0,
                notWorkedHours: 0,
                openHours: 0,
                workedShifts: 0,
                notWorkedShifts: 0,
                workedPeople: 0,
                notWorkedPeople: 0,
            };
        });
    }, [allDates, Responsedata?.days]);

    const visibleDays = processedDays.slice(currentIndex, currentIndex + daysToShow);
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b">
                <div>
                    <h2 className="text-lg font-semibold">Schedule overview</h2>
                    <p className="text-xs text-gray-500">
                        *Data shown includes saved shifts for the selected date range and filters
                    </p>
                </div>

            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {/* Schedule Total */}
                <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Schedule Total</h3>
                    <p className="text-3xl font-bold">{Responsedata?.Schedule_Total?.totalHours}hr</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Schedule_Total?.totalShifts}</span> Shifts
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Schedule_Total?.totalPeople}</span> People
                        </p>
                    </div>
                </div>

                {/* Assigned */}
                <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Assigned</h3>
                    <p className="text-3xl font-bold">{Responsedata?.Assigned?.totalHours} hr</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Assigned?.totalShifts}</span> Shifts
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Assigned?.totalPeople}</span> People
                        </p>
                    </div>
                </div>

                {/* Open */}
                <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Rejected</h3>
                    <p className="text-3xl font-bold">{Responsedata?.Rejected?.totalPeople} hr</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Rejected?.totalPeople}</span> Shifts
                        </p>
                        <p className="text-sm">
                            <span className="font-semibold">{Responsedata?.Rejected?.totalPeople}</span> People
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="p-6 relative">
                <div className="text-xs text-gray-500 -rotate-90 absolute left-0 top-1/2 transform -translate-y-1/2">hrs</div>
                <div className="ml-6 relative">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                        <div>240</div>
                        <div>180</div>
                        <div>120</div>
                        <div>60</div>
                        <div>0</div>
                    </div>

                    {/* Chart grid lines */}
                    <div className="ml-8 border-l border-gray-200 relative">
                        <div className="absolute w-full border-t border-dashed border-gray-200" style={{ top: "0%" }}></div>
                        <div className="absolute w-full border-t border-dashed border-gray-200" style={{ top: "25%" }}></div>
                        <div className="absolute w-full border-t border-dashed border-gray-200" style={{ top: "50%" }}></div>
                        <div className="absolute w-full border-t border-dashed border-gray-200" style={{ top: "75%" }}></div>
                        <div className="absolute w-full border-t border-dashed border-gray-200" style={{ top: "100%" }}></div>


                        {currentIndex > 0 && (
                            <button
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full shadow-md p-1 z-10"
                                onClick={prevPage}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}

                        {currentIndex + daysToShow < allDates.length && (
                            <button
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full shadow-md p-1 z-10"
                                onClick={nextPage}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}

                        {/* Bars */}
                        <div className="flex justify-between h-[240px] relative">
                            {visibleDays?.map((day: any, index: number) => {
                                const workedHeight = (day.workedHours / 240) * maxBarHeight
                                const notWorkedHeight = (day.notWorkedHours / 240) * maxBarHeight
                                const openHeight = (day.openHours / 240) * maxBarHeight

                                return (
                                    <Popover content={
                                        <>
                                            <div
                                                className=" p-4 w-64 "
                                            >
                                                <h3 className="font-medium mb-2">{day.fullDate}</h3>

                                                <div className="space-y-4">
                                                    {/* Schedule total */}
                                                    <div>
                                                        <h4 className="font-medium">Schedule total</h4>
                                                        <div className="grid grid-cols-2 text-sm mt-1">
                                                            <span className="text-gray">Hours</span>
                                                            <span className="text-right">{day.totalHours}</span>
                                                            <span>Shifts</span>
                                                            <span className="text-right">{day.totalShifts}</span>
                                                        </div>
                                                    </div>

                                                    {/* Worked */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-medium">Worked</h4>
                                                            <div className="text-sm text-right mb-1">
                                                                <span className="font-medium">
                                                                    {day.totalHours > 0
                                                                        ? `${((day.workedHours / day.totalHours) * 100).toFixed(2)}%`
                                                                        : "N/A"}
                                                                </span>

                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 text-sm">
                                                            <span>Hours</span>
                                                            <span className="text-right">{day.workedHours}</span>
                                                            <span>Shifts</span>
                                                            <span className="text-right">{day.workedShifts}</span>
                                                            <span>People</span>
                                                            <span className="text-right">{day.workedPeople}</span>
                                                        </div>
                                                    </div>

                                                    {/* Not worked */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-medium">Not worked</h4>
                                                            <div className="text-sm text-right mb-1">
                                                                <span className="font-medium">
                                                                    {day.totalHours > 0
                                                                        ? `${((day.notWorkedHours / day.totalHours) * 100).toFixed(2)}%`
                                                                        : "N/A"}
                                                                </span>

                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-2 text-sm">
                                                            <span>Hours</span>
                                                            <span className="text-right">{day.notWorkedHours}</span>
                                                            <span>Shifts</span>
                                                            <span className="text-right">{day.notWorkedShifts}</span>
                                                            <span>People</span>
                                                            <span className="text-right">{day.notWorkedPeople}</span>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </>

                                    } placement="rightTop" trigger="hover">

                                        <div
                                            key={index}
                                            className="flex flex-col justify-end items-center w-full"
                                        >
                                            <div className="relative w-full max-w-[80px] group">
                                                {/* Open shifts */}
                                                {openHeight > 0 && (
                                                    <div
                                                        className="w-full bg-red-500 transition-all duration-200"
                                                        style={{ height: `${openHeight}px` }}
                                                    ></div>
                                                )}

                                                {/* Not worked shifts */}
                                                {notWorkedHeight > 0 && (
                                                    <div
                                                        className="w-full bg-teal-700 transition-all duration-200"
                                                        style={{ height: `${notWorkedHeight}px` }}
                                                    ></div>
                                                )}

                                                {/* Worked shifts */}
                                                {workedHeight > 0 && (
                                                    <div
                                                        className="w-full bg-teal-400 transition-all duration-200"
                                                        style={{ height: `${workedHeight}px` }}
                                                    ></div>
                                                )}


                                            </div>

                                            {/* Day label */}
                                            <div className="mt-2 text-center">
                                                <p className="text-xs font-medium">{day.dayName}</p>
                                                <p className="text-xs text-gray-500">{day.shortDate}</p>
                                            </div>
                                        </div>
                                    </Popover>
                                )
                            })}
                        </div>
                    </div>
                </div>
                {/* View in Schedule link */}
                <div className="mt-4 text-center">
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                        View in Schedule
                    </a>
                </div>
            </div>

        </div >
    )
}

