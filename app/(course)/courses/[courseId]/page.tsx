import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { currentUser } from '@/lib/auth'
import CourseCard from "./course-feature";
import { CourseTabsDemo } from "./course-tab-demo";
import { Footer } from "@/app/(homepage)/footer";
import { CourseContent } from "./course-content";
import ConditionalHeader from "@/app/(homepage)/user-header";
import { CourseCardsCarousel } from "./course-card-carousel";
import GradientHeading from "./_components/gradient-heading";
import { CourseReviews } from "./_components/course-reviews";
import { EnrollButton } from "./_components/enroll-button";
import { Metadata } from "next";
import { CourseOutcomes } from "./_components/course-outcomes";

type CourseReview = {
  id: string;
  rating: number;
  comment: string;
  courseId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type Props = {
  params: Promise<{ courseId: string }>
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const courseId = await Promise.resolve(params.courseId);

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    }
  });

  return {
    title: course?.title || "Course Details | SkillHub",
    description: course?.description || "Learn new skills with our detailed courses"
  };
}

const CourseIdPage = async (props: {params: Promise<{ courseId: string; }>}) => {
  const params = await props.params;
  const courseId = await Promise.resolve(params.courseId);

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      category: true,
      reviews: true,
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          sections: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  const user:any = await currentUser();

  if (!course) {
    return redirect("/");
  }

  // Check if user is enrolled in this course
  let enrollment = null;
  if (user?.id) {
    try {
      enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: courseId,
          },
        },
      });
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  }

  const chapters = course?.chapters || [];

  // Fetch initial reviews with error handling
  let reviews: CourseReview[] = [];
  try {
    reviews = await db.courseReview.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Continue with empty reviews array
  }

  return (
    <div className="-mt-16">
      <CourseCard 
        course={course} 
        userId={user?.id}
        isEnrolled={!!enrollment}
      />
      <div className="mb-10">
        <GradientHeading 
          text="Course Breakdown"
          gradientFrom="from-purple-400"
          gradientVia="via-cyan-400"
          gradientTo="to-emerald-400"
          iconColor="text-purple-400"
        />
        
        <div className="">
          <div className="w-full overflow-hidden">
            <div className="relative">
              <CourseCardsCarousel chapters={chapters}/>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mx-auto mt-20 mb-5">
        <GradientHeading 
          text="Course Contents"
          gradientFrom="from-emerald-400"
          gradientVia="via-blue-400"
          gradientTo="to-purple-400"
          iconColor="text-emerald-400"
        />
      
        <div className="px-2 md:px-8">
          <CourseContent chapters={chapters} />
        </div>
      </div>

      <div className="mt-10">
        <GradientHeading 
          text="Course Reviews"
          gradientFrom="from-blue-400"
          gradientVia="via-indigo-400"
          gradientTo="to-violet-400"
          iconColor="text-blue-400"
        />
        
        <div className="mt-8">
          <CourseReviews courseId={courseId} initialReviews={reviews} />
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
 
export default CourseIdPage;