"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  DoughnutChart,
  CalendarHeatmap,
  RadarChart,
} from "./components/charts";
import { EnrollmentStats } from "./components/enrollment-stats";
import { CourseProgress } from "./components/course-progress";
import { ExamPerformance } from "./components/exam-performance";
import { ActivityTimeline } from "./components/activity-timeline";
import { LearningInsights } from "./components/learning-insights";
import { SkillsRadar } from "./components/skills-radar";
import { StudentFilters } from "./components/student-filters";
import { CompletionRates } from "./components/completion-rates";
import { TimeDistribution } from "./components/time-distribution";
import { StudentMetricsGrid } from "./components/student-metrics-grid";
import { StudentHeader } from "./components/student-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function StudentAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [studentData, setStudentData] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState(null);

  // Fetch student analytics data from the API
  const fetchStudentData = async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Add course filters if present
      if (filters.courses && filters.courses.length > 0) {
        queryParams.append('courses', filters.courses.join(','));
      }
      
      // Add date filters if present
      if (filters.dateRange && filters.dateRange.from) {
        queryParams.append('startDate', format(filters.dateRange.from, 'yyyy-MM-dd'));
        
        if (filters.dateRange.to) {
          queryParams.append('endDate', format(filters.dateRange.to, 'yyyy-MM-dd'));
        }
      }
      
      // Make the API request
      const queryString = queryParams.toString();
      const url = `/api/analytics/student${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching student data from: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudentData(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError(err.message || "Failed to load student data");
      setIsLoading(false);
      
      // Fallback to mock data for demo purposes
      // In a real app, you might want to show an error message instead
      setTimeout(() => {
        // Use the existing data if available or load demo data
        if (!studentData) {
          // Fetch from mock-data.json or similar in a real app
          // For now, using the same mock data as in the API
          import('./mock-data.json')
            .then(module => {
              setStudentData(module.default);
              setError(null);
            })
            .catch(error => {
              console.error("Failed to load fallback data:", error);
              // For demo, just hardcode some minimal fallback data
              setStudentData({
                name: "Demo User",
                enrolledCourses: 5,
                completedCourses: 3,
                averageScore: 85,
                totalLearningHours: 100,
                activeDays: 30,
                streak: 5,
                recentActivity: [],
                courseProgress: [],
                examPerformance: [],
                completionRates: { videos: 80, readings: 70, exercises: 60, exams: 90 },
                weeklyActivity: [],
                timeDistribution: { morning: 25, afternoon: 40, evening: 25, night: 10 },
                skillsRadar: [],
                learningInsights: []
              });
            });
        }
      }, 1000);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    fetchStudentData({
      courses: selectedCourses,
      dateRange: dateRange
    });
  }, [selectedCourses, dateRange]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading your learning analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !studentData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">Error Loading Data</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => fetchStudentData()} 
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null; // Should not happen, but just in case
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            {error} — Showing cached data instead.
          </p>
        </div>
      )}
      
      <StudentHeader 
        studentName={studentData.name}
        enrolledCourses={studentData.enrolledCourses}
        completedCourses={studentData.completedCourses}
        averageScore={studentData.averageScore}
        totalLearningHours={studentData.totalLearningHours}
        activeDays={studentData.activeDays}
        streak={studentData.streak}
      />
      
      <div className="mb-6">
        <StudentFilters 
          onDateRangeChange={setDateRange}
          onCoursesChange={setSelectedCourses}
        />
      </div>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="exams">Exams & Assessments</TabsTrigger>
          <TabsTrigger value="time">Time & Activity</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-6">
          <StudentMetricsGrid data={studentData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Course Completion</h3>
              <DoughnutChart 
                data={{
                  labels: ['Completed', 'In Progress', 'Not Started'],
                  datasets: [{
                    data: [studentData.completedCourses, 
                           studentData.courseProgress.filter(c => c.status === 'in-progress').length, 
                           0],
                    backgroundColor: ['#4ade80', '#60a5fa', '#d1d5db']
                  }]
                }}
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Exam Performance</h3>
              <LineChart 
                data={{
                  labels: studentData.examPerformance.map(exam => exam.course.split(' ')[0]),
                  datasets: [{
                    label: 'Score (%)',
                    data: studentData.examPerformance.map(exam => exam.score),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)'
                  }]
                }}
              />
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Weekly Activity</h3>
              <BarChart 
                data={{
                  labels: studentData.weeklyActivity.map(day => day.day),
                  datasets: [{
                    label: 'Hours',
                    data: studentData.weeklyActivity.map(day => day.hours),
                    backgroundColor: '#f97316'
                  }]
                }}
              />
            </Card>
            
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Skills Proficiency</h3>
              <RadarChart 
                data={{
                  labels: studentData.skillsRadar.map(skill => skill.skill),
                  datasets: [{
                    label: 'Proficiency',
                    data: studentData.skillsRadar.map(skill => skill.value),
                    backgroundColor: 'rgba(14, 165, 233, 0.2)',
                    borderColor: 'rgb(14, 165, 233)'
                  }]
                }}
              />
            </Card>
          </div>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <ActivityTimeline activities={studentData.recentActivity} />
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-6 pt-6">
          <CourseProgress courses={studentData.courseProgress} />
          <CompletionRates rates={studentData.completionRates} />
        </TabsContent>
        
        <TabsContent value="exams" className="space-y-6 pt-6">
          <ExamPerformance exams={studentData.examPerformance} />
        </TabsContent>
        
        <TabsContent value="time" className="space-y-6 pt-6">
          <TimeDistribution distribution={studentData.timeDistribution} />
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Learning Activity Heatmap</h3>
            <CalendarHeatmap />
          </Card>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6 pt-6">
          <LearningInsights insights={studentData.learningInsights} />
          <SkillsRadar skills={studentData.skillsRadar} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 