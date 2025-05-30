// Add "use client" directive to mark this component as a client component
"use client";

import { db } from "@/lib/db";
import { getCoursesForHomepage } from "@/actions/get-all-courses";
import { CourseCardHome } from "@/components/course-card-home";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, use } from "react";
import { SidebarDemo } from "@/components/ui/sidebar-demo";

interface SearchPageProps {
  searchParams: Promise<{
    title: string;
    categoryId: string;
  }>;
}

type CourseForHomepage = {
  id: string;
  title: string;
  description: string | null;
  cleanDescription: string | null;
  imageUrl: string | null;
  price: number | null;
  chaptersLength?: number;
  category: {
    id: string;
    name: string;
  } | null;
};

import { PlaceholdersAndVanishInput } from "./placeholders-and-vanish-input";

export default function PlaceholdersAndVanishInputDemo(props: SearchPageProps) {
  const searchParams = use(props.searchParams);
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const [courses, setCourses] = useState<CourseForHomepage[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const fetchedCourses = await getCoursesForHomepage();
      // Log the courses to see what we're getting
      console.log("Search page courses:", fetchedCourses.map(course => ({
        id: course.id,
        title: course.title,
        cleanDescription: course.cleanDescription?.substring(0, 30)
      })));
      setCourses(fetchedCourses);
    };
    fetchCourses();
  }, [searchParams]);



  return (
    <SidebarDemo>
      <div className="h-[10rem] flex flex-col justify-center items-center px-4 mt-7">
        <h2 className="mb-2 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black font-semibold">
          Search <span className="text-blue-600">Courses</span> and <span className="text-sky-800">Blogs</span>
        </h2>
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
        />
      </div>
      <div className="mt-4">
        <div className="h-full w-full mt-0 p-4 ">
          <Separator className="mb-4" />
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {courses.map((item) => (
              <CourseCardHome
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl || '/default-image.jpg'}
                price={item.price || 0}
                category={item?.category?.name || 'Uncategorized'}
                cleanDescription={item.cleanDescription || item.description || ''}
                chaptersLength={item.chaptersLength || 0}
              />
            ))}
          </div>
          {courses.length === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-10">
              No courses found
            </div>
          )}
        </div>
      </div>
    </SidebarDemo>
  );
}

