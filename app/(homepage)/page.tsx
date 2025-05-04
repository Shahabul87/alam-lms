import { getCoursesForHomepage } from "@/actions/get-all-courses";
import { getPostsForHomepage } from "@/actions/get-all-posts";
import HomeHeroSection from "./home-hero-section";
import { HomeFooter } from "./HomeFooter";
import { FeaturedCoursesSection } from "./featured-courses-section";
import { FeaturedBlogPostsSection } from "./featured-blog-posts-section";

const Home = async () => {
  const courses = await getCoursesForHomepage();
  const posts = await getPostsForHomepage();

  console.log("Home page courses:", courses.map(course => ({ 
    id: course.id, 
    title: course.title,
    cleanDescription: course.cleanDescription?.substring(0, 30),
    description: course.description?.substring(0, 30)
  })));

  return (
    <>
      <HomeHeroSection />
      <div className="min-h-screen">
        <FeaturedCoursesSection courses={courses} />
        <FeaturedBlogPostsSection posts={posts} />
      </div>

      <HomeFooter />
    </>
  );
};

export default Home;
