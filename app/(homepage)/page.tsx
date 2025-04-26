import { db } from "@/lib/db";
import { getCoursesForHomepage } from "@/actions/get-all-courses";
import { Categories } from "../(protected)/search/_components/categories";
import { InfiniteMovingCardsDemo } from "@/components/infinite-moving-cards-demo";
import { Footer } from "./footer";
import { CallToAction } from "./calltoaction";
import { currentUser } from '@/lib/auth'
import { MainFooter } from "./main-footer";
import { FeatureAction } from "./feature-action";
import { HeaderAfterLogin } from "./header-after-login";
import { getPostsForHomepage } from "@/actions/get-all-posts";
import HomeHeroSection from "./home-hero-section";
import { HomeFooter } from "./HomeFooter";
import { WhatInspiredMe } from "./what-inspired-me";
import Image from "next/image";
import { FeaturedCoursesSection } from "./featured-courses-section";
import { FeaturedBlogPostsSection } from "./featured-blog-posts-section";

const Home = async () => {
  const user = await currentUser();
  const courses = await getCoursesForHomepage();
  const posts = await getPostsForHomepage();

  return (
    <>
      <HeaderAfterLogin user={user} />
      <HomeHeroSection />
      <div className="min-h-screen">
        <FeaturedCoursesSection courses={courses} />
        <FeaturedBlogPostsSection posts={posts} />
      </div>

      {/* <FeatureAction /> */}
      {/* <CallToAction /> */}
      <HomeFooter />
    </>
  );
};

export default Home;
