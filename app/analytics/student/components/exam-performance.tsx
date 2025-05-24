"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart,
  BarChart
} from "./charts";
import { format, parseISO } from "date-fns";

interface Exam {
  id: number;
  course: string;
  score: number;
  date: string;
}

interface ExamPerformanceProps {
  exams: Exam[];
}

export function ExamPerformance({ exams }: ExamPerformanceProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Sort exams by date, newest first
  const sortedExams = [...exams].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Calculate average, highest, and lowest scores
  const averageScore = exams.length > 0
    ? Math.round(exams.reduce((sum, exam) => sum + exam.score, 0) / exams.length)
    : 0;
    
  const highestScore = exams.length > 0
    ? Math.max(...exams.map(exam => exam.score))
    : 0;
    
  const lowestScore = exams.length > 0
    ? Math.min(...exams.map(exam => exam.score))
    : 0;
    
  // Format for charts
  const chartData = {
    labels: sortedExams.map(exam => exam.course.split(' ')[0]),
    datasets: [{
      label: 'Score (%)',
      data: sortedExams.map(exam => exam.score),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)'
    }]
  };
  
  // Define score categories
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (score >= 80) return { label: "Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (score >= 70) return { label: "Satisfactory", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    if (score >= 60) return { label: "Pass", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Exam Performance</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View your assessment results and performance trends
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">View as:</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${chartType === "line" 
                  ? "bg-blue-600 text-white dark:bg-blue-700" 
                  : "text-gray-700 dark:text-gray-300"}`}
                onClick={() => setChartType("line")}
              >
                Line
              </button>
              <button 
                className={`px-3 py-1 text-sm ${chartType === "bar" 
                  ? "bg-blue-600 text-white dark:bg-blue-700" 
                  : "text-gray-700 dark:text-gray-300"}`}
                onClick={() => setChartType("bar")}
              >
                Bar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
          <h3 className="text-2xl font-bold mt-1">{averageScore}%</h3>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Score</p>
          <h3 className="text-2xl font-bold mt-1">{highestScore}%</h3>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lowest Score</p>
          <h3 className="text-2xl font-bold mt-1">{lowestScore}%</h3>
        </Card>
      </div>
      
      {/* Performance Chart */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Performance Trend</h3>
        {chartType === "line" ? (
          <LineChart data={chartData} />
        ) : (
          <BarChart data={chartData} />
        )}
      </Card>
      
      {/* Performance Table */}
      <Card>
        <h3 className="text-xl font-semibold p-6 pb-0">Assessment Details</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExams.map(exam => {
              const scoreCategory = getScoreCategory(exam.score);
              return (
                <TableRow key={exam.id}>
                  <TableCell>{exam.course}</TableCell>
                  <TableCell className="text-right font-medium">{exam.score}%</TableCell>
                  <TableCell>
                    <Badge className={scoreCategory.color}>{scoreCategory.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{format(parseISO(exam.date), 'MMM d, yyyy')}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 