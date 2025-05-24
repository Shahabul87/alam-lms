import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    let user;
    try {
      user = await currentUser();
      if (!user) {
        console.log("Analytics API: No authenticated user found, using demo data");
        user = { id: 'demo-user' };
      }
    } catch (error) {
      console.log("Analytics API: Error in authentication, using demo data", error);
      user = { id: 'demo-user' };
    }

    // Get query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const courseIds = searchParams.get('courses')?.split(',') || [];
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Log analytics request
    console.log(`Analytics API: Fetching student data for user ${user.id}`);
    console.log(`Analytics API: Filters - courses: ${courseIds.length > 0 ? courseIds.join(', ') : 'all'}`);
    console.log(`Analytics API: Filters - date range: ${startDate || 'none'} to ${endDate || 'none'}`);

    // In a real application, we would fetch this data from the database
    // based on the authenticated user and apply the filters
    // For this demo, we'll return mock data
    
    // Mock student data
    const studentData = {
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      enrolledCourses: 8,
      completedCourses: 5,
      averageScore: 87,
      totalLearningHours: 142,
      activeDays: 45,
      streak: 12,
      recentActivity: [
        { id: 1, type: "course_progress", course: "Advanced Web Development", action: "completed section", date: "2023-05-20T14:30:00" },
        { id: 2, type: "exam", course: "UI/UX Fundamentals", action: "scored 92%", date: "2023-05-19T10:15:00" },
        { id: 3, type: "video", course: "Data Science Basics", action: "watched lecture", date: "2023-05-18T16:45:00" }
      ],
      courseProgress: [
        { id: 1, name: "JavaScript Mastery", progress: 100, status: "completed" },
        { id: 2, name: "React Fundamentals", progress: 100, status: "completed" },
        { id: 3, name: "Node.js Backend", progress: 100, status: "completed" },
        { id: 4, name: "UI/UX Fundamentals", progress: 100, status: "completed" },
        { id: 5, name: "Advanced Web Development", progress: 100, status: "completed" },
        { id: 6, name: "Python for Data Science", progress: 75, status: "in-progress" },
        { id: 7, name: "Machine Learning Basics", progress: 60, status: "in-progress" },
        { id: 8, name: "AWS Cloud Essentials", progress: 25, status: "in-progress" }
      ],
      examPerformance: [
        { id: 1, course: "JavaScript Mastery", score: 92, date: "2023-02-15T10:00:00" },
        { id: 2, course: "React Fundamentals", score: 88, date: "2023-03-10T14:30:00" },
        { id: 3, course: "Node.js Backend", score: 95, date: "2023-03-25T11:15:00" },
        { id: 4, course: "UI/UX Fundamentals", score: 90, date: "2023-04-12T09:45:00" },
        { id: 5, course: "Advanced Web Development", score: 87, date: "2023-05-05T13:20:00" },
        { id: 6, course: "Python for Data Science", score: 84, date: "2023-05-19T15:10:00" }
      ],
      completionRates: {
        videos: 92,
        readings: 85,
        exercises: 78,
        exams: 100
      },
      weeklyActivity: [
        { day: "Monday", hours: 2.5 },
        { day: "Tuesday", hours: 1.8 },
        { day: "Wednesday", hours: 3.2 },
        { day: "Thursday", hours: 2.0 },
        { day: "Friday", hours: 1.5 },
        { day: "Saturday", hours: 4.0 },
        { day: "Sunday", hours: 2.7 }
      ],
      timeDistribution: {
        morning: 30,
        afternoon: 45,
        evening: 20,
        night: 5
      },
      skillsRadar: [
        { skill: "JavaScript", value: 85 },
        { skill: "React", value: 80 },
        { skill: "Node.js", value: 75 },
        { skill: "UI/UX", value: 70 },
        { skill: "Python", value: 60 },
        { skill: "Machine Learning", value: 40 },
        { skill: "AWS", value: 30 }
      ],
      learningInsights: [
        "Excels in programming courses, particularly JavaScript and backend development",
        "Consistent daily learning pattern with higher activity on weekends",
        "Completes video content at a higher rate than exercises and readings",
        "Moving from web development focus to data science and ML topics",
        "Could benefit from more hands-on exercises in newer subject areas"
      ]
    };

    // Filter the data based on course IDs if provided
    if (courseIds.length > 0) {
      studentData.courseProgress = studentData.courseProgress.filter(course => 
        courseIds.includes(course.id.toString())
      );
      
      studentData.examPerformance = studentData.examPerformance.filter(exam =>
        studentData.courseProgress.some(course => course.name === exam.course)
      );
    }

    // Filter the data based on date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      studentData.recentActivity = studentData.recentActivity.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= start && activityDate <= end;
      });
      
      studentData.examPerformance = studentData.examPerformance.filter(exam => {
        const examDate = new Date(exam.date);
        return examDate >= start && examDate <= end;
      });
    }

    return NextResponse.json(studentData);
  } catch (error) {
    console.error('Analytics API: Error fetching student data:', error);
    return new NextResponse('Error fetching student data', { status: 500 });
  }
} 