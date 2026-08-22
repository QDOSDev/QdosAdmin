"use client"

export default function Component() {
  const chartData = [
    { day: "Sun", visits: 30, x: 50, y: 180 },
    { day: "Mon", visits: 45, x: 100, y: 150 },
    { day: "Tue", visits: 25, x: 150, y: 200 },
    { day: "Wed", visits: 60, x: 200, y: 120 },
    { day: "Thu", visits: 50, x: 250, y: 140 },
    { day: "Fri", visits: 70, x: 300, y: 100 },
    { day: "Sat", visits: 55, x: 350, y: 130 },
  ]

  const pathData = chartData.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-10xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Members</p>
            <p className="text-4xl font-bold text-purple-600">120</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Revenue</p>
            <p className="text-4xl font-bold text-green-500">$8,250</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Visits Today</p>
            <p className="text-4xl font-bold text-orange-500">46</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Gyms Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Gyms Status</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Powerhouse Gym</h3>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    Approved
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Last updated: May 20, 2025</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Elite Fitness Center</h3>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    Pending
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Last updated: May 18, 2025</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Iron Paradise</h3>
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    Rejected
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Last updated: May 15, 2025</p>
              </div>
            </div>
          </div>

          {/* Weekly Visits Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Visits</h2>
            <div className="relative">
              {/* Chart Container */}
              <div className="h-64 relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500">
                  <span>70</span>
                  <span>53</span>
                  <span>35</span>
                  <span>18</span>
                  <span>0</span>
                </div>

                {/* Chart Area */}
                <div className="ml-8 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: `${i * 25}%` }} />
                    ))}
                  </div>

                  {/* Chart SVG */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240">
                    {/* Chart line */}
                    <path d={pathData} stroke="#8b5cf6" strokeWidth="3" fill="none" className="drop-shadow-sm" />

                    {/* Data points */}
                    {chartData.map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#8b5cf6"
                        className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-4 ml-8 text-sm text-gray-500">
                {chartData.map((point) => (
                  <span key={point.day}>{point.day}</span>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center mt-6">
              <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
              <span className="text-sm font-medium text-gray-900">Weekly Visits</span>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Active Memberships</p>
            <p className="text-2xl font-bold text-blue-600">98</p>
            <p className="text-green-500 text-sm mt-1">↗ +5% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Equipment Usage</p>
            <p className="text-2xl font-bold text-indigo-600">87%</p>
            <p className="text-green-500 text-sm mt-1">↗ +12% from last week</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Peak Hours</p>
            <p className="text-2xl font-bold text-pink-600">6-8 PM</p>
            <p className="text-gray-500 text-sm mt-1">Most active time</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <p className="text-gray-500 text-sm mb-2">Monthly Growth</p>
            <p className="text-2xl font-bold text-emerald-600">+15%</p>
            <p className="text-green-500 text-sm mt-1">↗ Above target</p>
          </div>
        </div> */}
      </div>
    </div>
  )
}
