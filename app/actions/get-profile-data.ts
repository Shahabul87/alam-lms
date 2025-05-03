"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getProfileData() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  try {
    const userData = await db.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        profileLinks: true,
        courses: {
          include: {
            category: true
          }
        },
        ideas: true,
        posts: true,
        favoriteVideos: true,
        favoriteAudios: true, 
        favoriteBlogs: true,
        favoriteArticles: true,
        subscriptions: true
      }
    });

    return userData;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return null;
  }
} 