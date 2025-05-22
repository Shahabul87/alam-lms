"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { PlusCircle, Search, Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({columns, data}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [isLoading, setIsLoading] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  })

  // Get unique categories and handle empty/null cases
  const uniqueCategories = Array.from(
    new Set(
      data.map((item: any) => 
        item.category?.name || 'Uncategorized'
      )
    )
  ).filter(Boolean);

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      table.getColumn("category")?.setFilterValue(undefined);
    } else {
      table.getColumn("category")?.setFilterValue(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-4">
          <div className={cn(
            "flex flex-col sm:flex-row items-center gap-4",
            "p-4 rounded-lg",
            "bg-white/50 dark:bg-gray-800/50",
            "backdrop-blur-sm",
            "border border-gray-100 dark:border-gray-700"
          )}>
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("title")?.setFilterValue(event.target.value)
                }
                className={cn(
                  "pl-9 w-full",
                  "bg-white dark:bg-gray-800",
                  "border-gray-200 dark:border-gray-700",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "focus:ring-purple-500",
                  "transition-all duration-200"
                )}
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={(table.getColumn("category")?.getFilterValue() as string) ?? "all"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className={cn(
                    "w-full sm:w-[180px]",
                    "bg-white dark:bg-gray-800",
                    "border-gray-200 dark:border-gray-700",
                    "text-gray-900 dark:text-white",
                    "transition-all duration-200"
                  )}>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="all" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      All Categories
                    </SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Create Course Button - Mobile */}
            <div className="w-full sm:hidden">
              <Link href="/teacher/create" className="w-full block">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id} 
                      className="text-gray-700 dark:text-gray-300 font-medium py-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      "border-gray-200 dark:border-gray-700",
                      "transition-all duration-200",
                      "hover:bg-purple-50 dark:hover:bg-purple-500/10",
                      "group",
                      "data-[state=selected]:bg-purple-100 dark:data-[state=selected]:bg-purple-800/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white py-4 transition-colors"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-3">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>No courses found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Showing {table.getFilteredRowModel().rows.length > 0 ? 
            `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}` : '0'} of {table.getFilteredRowModel().rows.length} courses
        </div>
        
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            variant="outline"
            size="sm"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              !table.getCanPreviousPage()
                ? "bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
            size="sm"
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              !table.getCanNextPage()
                ? "bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}