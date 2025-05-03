import { SidebarDemo } from "@/components/ui/sidebar-demo";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResourceCenter } from "./_components/resource-center";

export default async function ResourcesPage() {
  const user = await currentUser();
  
  if (!user?.id) {
    return redirect("/");
  }

  return (
    <SidebarDemo>
      <div className="p-6 pt-16">
        <ResourceCenter userId={user.id!} />
      </div>
    </SidebarDemo>
  );
} 