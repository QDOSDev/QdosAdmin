import { useState } from "react"

export default function LateComers({ Responsedata }: any) {
    const [searchTerm, setSearchTerm] = useState("")

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Late comers</h2>
                <p className="text-xs text-gray-500">
                    *23 guards checked-in 5 or more minutes late at least 1 time for the selected date range and filters
                </p>
            </div>

            {/* Search input */}
            <div className="p-4 border-b">
                <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Late comers list */}
            {/* <div className="p-4 max-h-[400px] overflow-y-auto">
                {filteredData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No results found</div>
                ) : (
                    <div className="space-y-3">
                        {filteredData.map((person: any, index: number) => {
                            // Calculate color intensity based on number of times late
                            const colorIntensity = (person.times / maxTimes) * 100

                            return (
                                <div key={index} className="flex items-center">
                                    <div className="w-1/3 text-right pr-4 text-sm">{person.name}</div>
                                    <div className="w-2/3 flex items-center">
                                        <div
                                            className="h-8 rounded-sm flex items-center justify-end pr-2 text-sm"
                                            style={{
                                                width: `${(person.times / maxTimes) * 100}%`,
                                                backgroundColor: `rgba(56, 178, 172, ${0.3 + (colorIntensity * 0.7) / 100})`,
                                            }}
                                        >
                                            {person.times} times
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div> */}
        </div>
    )
}

