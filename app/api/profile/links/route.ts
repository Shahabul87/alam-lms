import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const userId = session.user.id;
    
    const profileLinks = await db.profileLink.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(profileLinks, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_LINKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { userId, links } = await req.json();
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Only allow users to modify their own profile links or if admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Get existing links to determine which to delete
    const existingLinks = await db.profileLink.findMany({
      where: {
        userId
      },
      select: {
        id: true
      }
    });
    
    const existingIds = existingLinks.map(link => link.id);
    const newIds = links.filter(link => !link.id.startsWith('temp-')).map(link => link.id);
    
    // IDs to delete (found in existing but not in new)
    const idsToDelete = existingIds.filter(id => !newIds.includes(id));
    
    // Delete links that were removed
    if (idsToDelete.length > 0) {
      await db.profileLink.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      });
    }
    
    // Process each link (create new ones, update existing)
    const updatedLinks = await Promise.all(
      links.map(async (link) => {
        // For temporary IDs, create new records
        if (link.id.startsWith('temp-')) {
          return db.profileLink.create({
            data: {
              platform: link.platform,
              url: link.url,
              userId
            }
          });
        } 
        // For existing IDs, update records
        else {
          return db.profileLink.update({
            where: {
              id: link.id
            },
            data: {
              platform: link.platform,
              url: link.url
            }
          });
        }
      })
    );
    
    return NextResponse.json(updatedLinks, { status: 200 });
  } catch (error) {
    console.error("[PROFILE_LINKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const linkId = url.searchParams.get("linkId");
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    if (!linkId) {
      return new NextResponse("Link ID is required", { status: 400 });
    }
    
    // Find the link to check ownership
    const link = await db.profileLink.findUnique({
      where: {
        id: linkId
      }
    });
    
    if (!link) {
      return new NextResponse("Link not found", { status: 404 });
    }
    
    // Verify ownership
    if (link.userId !== session.user.id && session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Delete the link
    await db.profileLink.delete({
      where: {
        id: linkId
      }
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROFILE_LINKS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 