"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface StudentFiltersProps {
  onDateRangeChange: (range: { from: Date | null, to: Date | null }) => void;
  onCoursesChange: (courses: string[]) => void;
}

export function StudentFilters({ 
  onDateRangeChange,
  onCoursesChange
}: StudentFiltersProps) {
  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  // Mock course data - would come from API in real app
  const availableCourses = [
    { id: "js", name: "JavaScript Mastery" },
    { id: "react", name: "React Fundamentals" },
    { id: "node", name: "Node.js Backend" },
    { id: "uiux", name: "UI/UX Fundamentals" },
    { id: "web", name: "Advanced Web Development" },
    { id: "python", name: "Python for Data Science" },
    { id: "ml", name: "Machine Learning Basics" },
    { id: "aws", name: "AWS Cloud Essentials" }
  ];

  function handleDateChange(range) {
    setDate(range);
    onDateRangeChange(range);
  }
  
  function handleCourseToggle(courseId: string) {
    setSelectedCourses(prev => {
      const isSelected = prev.includes(courseId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== courseId) 
        : [...prev, courseId];
        
      onCoursesChange(newSelection);
      return newSelection;
    });
  }
  
  function clearFilters() {
    setDate({ from: null, to: null });
    setSelectedCourses([]);
    onDateRangeChange({ from: null, to: null });
    onCoursesChange([]);
  }
  
  const dateDisplay = date.from ? (
    date.to ? (
      <>
        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
      </>
    ) : (
      format(date.from, "LLL dd, y")
    )
  ) : (
    "Select date range"
  );
  
  const coursesDisplay = selectedCourses.length ? (
    `${selectedCourses.length} selected`
  ) : (
    "All courses"
  );

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
        <h2 className="text-lg font-semibold">Filters</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{dateDisplay}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={date.from || new Date()}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
                className="border-0"
              />
            </PopoverContent>
          </Popover>
          
          {/* Course Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <ChevronDown className="mr-2 h-4 w-4" />
                <span>{coursesDisplay}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Select Courses</h4>
                {availableCourses.map(course => (
                  <div key={course.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={course.id} 
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => handleCourseToggle(course.id)}
                    />
                    <label 
                      htmlFor={course.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {course.name}
                    </label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            disabled={!date.from && selectedCourses.length === 0}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </Card>
  );
} 