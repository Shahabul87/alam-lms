import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CodeExplanationForm } from "../../_components/_explanations/code-explanation-form";

const CodeExplanationCreatePage = async ({
  params
}: {
  params: { 
    courseId: string; 
    chapterId: string; 
    sectionId: string; 
  }
}) => {
  const session = await currentUser();
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId
    }
  });

  if (!course) {
    return redirect("/");
  }

  return ( 
    <div className="p-6">
      <CodeExplanationForm
        courseId={params.courseId}
        chapterId={params.chapterId}
        sectionId={params.sectionId}
        initialData={{}}
      />
    </div>
  );
}

export default CodeExplanationCreatePage; 