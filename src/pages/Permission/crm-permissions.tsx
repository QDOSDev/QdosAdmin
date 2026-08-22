"use client"

import { useState } from "react"

export default function AdminWallet() {
  const [activeTab, setActiveTab] = useState("withdraw")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-emerald-100 rounded-lg shadow-sm">
            <div className="p-4 pb-2">
              <p className="text-sm text-gray-500">Total Balance</p>
              <h3 className="text-3xl font-bold">$12,580.00</h3>
            </div>
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Updated 2 hours ago</div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-500"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
                  <path d="M18 12H9"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm p-4">
            <div className="pb-2">
              <p className="text-sm text-gray-500">Recent Income</p>
              <h3 className="text-2xl font-bold text-emerald-600 flex items-center">
                $2,450.00
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="m5 12 7-7 7 7"></path>
                  <path d="M19 19H5"></path>
                </svg>
              </h3>
            </div>
            <div>
              <p className="text-sm text-gray-500">+12.5% from last month</p>
            </div>
          </div>

          <div className="border rounded-lg shadow-sm p-4">
            <div className="pb-2">
              <p className="text-sm text-gray-500">Recent Withdrawals</p>
              <h3 className="text-2xl font-bold text-rose-600 flex items-center">
                $1,280.00
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2"
                >
                  <path d="M19 5v14H5V5h14Z" fill="none"></path>
                  <path d="m5 12 7 7 7-7"></path>
                  <path d="M5 5h14"></path>
                </svg>
              </h3>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last withdrawal: May 3, 2025</p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 py-2 text-center ${activeTab === "withdraw" ? "bg-teal-50 text-teal-700 font-medium" : "bg-white text-gray-600"}`}
            >
              Withdraw Funds
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-2 text-center ${activeTab === "history" ? "bg-teal-50 text-teal-700 font-medium" : "bg-white text-gray-600"}`}
            >
              Transaction History
            </button>
          </div>

          {activeTab === "withdraw" && (
            <div className="border rounded-lg mt-4 shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Withdraw Funds</h3>
                <p className="text-sm text-gray-500">
                  Transfer your funds to your bank account. Processing usually takes 1-2 business days.
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="accountNumber" className="text-sm font-medium">
                      Bank Account Number
                    </label>
                    <input
                      id="accountNumber"
                      type="text"
                      placeholder="Enter your account number"
                      className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="ifscCode" className="text-sm font-medium">
                      IFSC Code
                    </label>
                    <input
                      id="ifscCode"
                      type="text"
                      placeholder="Enter IFSC code"
                      className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="accountName" className="text-sm font-medium">
                      Account Holder Name
                    </label>
                    <input
                      id="accountName"
                      type="text"
                      placeholder="Enter account holder name"
                      className="w-full px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="withdrawalAmount" className="text-sm font-medium">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        id="withdrawalAmount"
                        type="text"
                        placeholder="0.00"
                        className="w-full pl-9 px-3 py-2 border border-teal-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-teal-600 mt-0.5"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                      <line x1="2" x2="22" y1="10" y2="10"></line>
                    </svg>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Withdrawal Information</h4>
                      <p className="text-xs text-gray-500">
                        Minimum withdrawal amount is $100. Funds will be transferred to your registered bank account
                        within 1-2 business days. A processing fee of 1% may apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-between">
                <button className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700">
                  Process Withdrawal
                </button>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="border rounded-lg mt-4 shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Transaction History</h3>
                <p className="text-sm text-gray-500">View your recent transactions and withdrawal history.</p>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {[
                    { type: "Withdrawal", amount: "$1,280.00", date: "May 3, 2025", status: "Completed" },
                    { type: "Deposit", amount: "$2,450.00", date: "Apr 28, 2025", status: "Completed" },
                    { type: "Withdrawal", amount: "$950.00", date: "Apr 15, 2025", status: "Completed" },
                    { type: "Deposit", amount: "$3,200.00", date: "Apr 2, 2025", status: "Completed" },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {transaction.type === "Withdrawal" ? (
                          <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-rose-600"
                            >
                              <path d="m5 12 7 7 7-7"></path>
                              <path d="M19 19H5"></path>
                            </svg>
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-emerald-600"
                            >
                              <path d="m5 12 7-7 7 7"></path>
                              <path d="M19 19H5"></path>
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{transaction.type}</p>
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${transaction.type === "Withdrawal" ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {transaction.type === "Withdrawal" ? "-" : "+"}
                          {transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t">
                <button className="w-full px-4 py-2 border rounded-md text-sm font-medium">
                  View All Transactions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
