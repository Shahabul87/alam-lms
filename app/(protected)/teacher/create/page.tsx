import { SidebarDemo } from "@/components/ui/sidebar-demo"
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateNewCoursePage } from "./create-course";
import { cn } from "@/lib/utils";

const CourseCreationPage = async() => {
    const user = await currentUser();

    if(!user?.id){
        return redirect("/");
    }

    return (
        <>
            <SidebarDemo>
                <div className={cn(
                    "min-h-[calc(100vh-80px)]",
                    "bg-gray-50/50 dark:bg-gray-900/50",
                    "flex items-center justify-center"
                )}>
                    <CreateNewCoursePage />
                </div>
            </SidebarDemo>
        </>
    )
}

export default CourseCreationPage;
