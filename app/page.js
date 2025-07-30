"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend
} from "recharts";
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender
} from "@tanstack/react-table";

import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";

import { motion } from "framer-motion";

// ---------- Initial Chart Data ----------
const initialChartData = [
  { name: "Jan", revenue: 4000, users: 2400 },
  { name: "Feb", revenue: 3000, users: 1398 },
  { name: "Mar", revenue: 2000, users: 9800 },
  { name: "Apr", revenue: 2780, users: 3908 },
  { name: "May", revenue: 1890, users: 4800 },
];

const initialPieData = [
  { name: "Conversions", value: 400 },
  { name: "Non-Conversions", value: 600 },
];

const COLORS = ["#6366f1", "#e5e7eb"];

// ---------- Data Table ----------
function DataTable({ data, columns }) {
  const [filter, setFilter] = useState("");
  const table = useReactTable({
    data, columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Export CSV function
  const exportCSV = () => {
    const csvRows = [];
    const headers = columns.map(col => col.header);
    csvRows.push(headers.join(","));

    table.getRowModel().rows.forEach(row => {
      const values = row.getVisibleCells().map(cell => cell.getValue());
      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "data.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="overflow-hidden backdrop-blur-md bg-white/80 dark:bg-gray-800/60 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Users Data</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-1/3"
            />
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer hover:text-indigo-600"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " 🔼" : header.column.getIsSorted() === "desc" ? " 🔽" : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-gray-400">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-indigo-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <p className="text-sm text-gray-500">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Chart Component ----------
function ChartComponent({ type, chartData, pieData }) {
  return (
    <div className="flex justify-center items-center">
      {type === "line" && (
        <LineChart width={350} height={220} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ReTooltip cursor={{ fill: "rgba(99, 102, 241, 0.1)" }} />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#6366f1" />
        </LineChart>
      )}
      {type === "bar" && (
        <BarChart width={350} height={220} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ReTooltip />
          <Legend />
          <Bar dataKey="users" fill="#10b981" />
        </BarChart>
      )}
      {type === "pie" && (
        <PieChart width={350} height={220}>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <ReTooltip />
        </PieChart>
      )}
    </div>
  );
}

// ---------- Main Dashboard ----------
export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState(initialChartData);
  const [pieData, setPieData] = useState(initialPieData);
  const [metrics, setMetrics] = useState([
    { metric: "Revenue", value: 45000, trend: "+12%" },
    { metric: "Users", value: 8200, trend: "+5%" },
    { metric: "Conversions", value: 1240, trend: "-3%" },
    { metric: "Growth", value: 18, trend: "+1.5%" }
  ]);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const tableData = useMemo(
    () => [
      { id: 1, name: "Alice", email: "alice@example.com", revenue: 1200, date: "2025-01-05" },
      { id: 2, name: "Bob", email: "bob@example.com", revenue: 900, date: "2025-02-18" },
      { id: 3, name: "Charlie", email: "charlie@example.com", revenue: 1500, date: "2025-03-10" },
      { id: 4, name: "Diana", email: "diana@example.com", revenue: 1100, date: "2025-04-20" },
      { id: 5, name: "Eve", email: "eve@example.com", revenue: 700, date: "2025-05-25" },
    ],
    []
  );

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "revenue", header: "Revenue ($)" },
      { accessorKey: "date", header: "Date" },
    ],
    []
  );

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  // Real-time updates every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Update chartData randomly
      setChartData(prev =>
        prev.map(d => ({
          ...d,
          revenue: d.revenue + Math.floor(Math.random() * 500 - 250),
          users: d.users + Math.floor(Math.random() * 200 - 100),
        }))
      );

      // Update pieData randomly
      setPieData(prev => {
        const total = prev[0].value + prev[1].value;
        const conversions = Math.max(100, prev[0].value + Math.floor(Math.random() * 100 - 50));
        return [
          { name: "Conversions", value: conversions },
          { name: "Non-Conversions", value: Math.max(100, total - conversions) },
        ];
      });

      // Update metrics randomly
      setMetrics(prev =>
        prev.map(m => ({
          ...m,
          value: Math.max(0, m.value + Math.floor(Math.random() * 100 - 50)),
          trend: `${Math.random() > 0.5 ? "+" : "-"}${(Math.random() * 5).toFixed(1)}%`
        }))
      );

      // Update last updated time
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen p-6 relative transition-colors bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient">
        
        {/* Floating Dark Mode Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-2 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 px-3 py-2 rounded-full shadow-md">
          <span className="text-sm text-gray-700 dark:text-gray-300">🌞/🌚</span>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center"
        >
          ✦ ADmyBRAND Insights
        </motion.h1>

        {/* Last updated label */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metrics.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="hover:shadow-lg hover:shadow-indigo-200 transition-all transform hover:-translate-y-1 backdrop-blur-md bg-white/80 dark:bg-gray-800/60">
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-20 animate-pulse" />
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">{item.metric}</p>
                      <h2 className="text-2xl font-bold mt-2">
                        {item.metric === "Growth" ? `${item.value}%` : item.value.toLocaleString()}
                      </h2>
                      <p className={`text-xs mt-1 ${item.trend.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {item.trend}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {["line", "bar", "pie"].map((chart, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3 }}
            >
              <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-800/60 shadow-md">
                {loading ? <Skeleton className="h-64 animate-pulse" /> : <ChartComponent type={chart} chartData={chartData} pieData={pieData} />}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Data Table */}
        {loading ? (
          <Skeleton className="h-64 animate-pulse" />
        ) : (
          <DataTable data={tableData} columns={columns} />
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          © 2025 ✦ ADmyBRAND. All rights reserved.
        </p>
      </main>
    </div>
  );
}
