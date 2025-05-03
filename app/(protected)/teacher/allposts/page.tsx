import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostDashboard } from "./_components/post-dashboard";
import { SidebarDemo } from "@/components/ui/sidebar-demo";

const AllPostsPage = async () => {
  const user = await currentUser();

  if (!user?.id) {
    return redirect("/");
  }

  return (
    <>
      <SidebarDemo>
        <PostDashboard /> {/* Dashboard component to render all posts */}
      </SidebarDemo>
    </>
  );
};

export default AllPostsPage;

  