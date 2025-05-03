import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  props: { params: Promise<{ courseId: string; chapterId: string; sectionId: string }> }
) {
  const params = await props.params;
  try {
    const user = await currentUser();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sectionOwner = await db.section.findUnique({
      where: {
        id: params.sectionId,
        chapter: {
          courseId: params.courseId
        }
      }
    });

    if (!sectionOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get only code explanations that are marked as math equations
    const mathEquations = await db.codeExplanation.findMany({
      where: {
        sectionId: params.sectionId,
        code: {
          not: null,  // Ensure code field is not null (could be equation or JSON data)
        },
        explanation: {
          not: null,  // Ensure explanation field exists
        },
        // We'll use metadata in the code field to determine if it's a math equation
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Filter to only return math equations by checking content structure
    const filteredMathEquations = mathEquations.filter(item => {
      // Check if it looks like a math equation
      try {
        // If it starts with a proper math equation marker, or is simple LaTeX
        if (item.heading?.toLowerCase().includes('math') || 
            item.heading?.includes('equation') ||
            (item.code && !item.code.includes('{') && !item.code.includes('[') && !item.code.includes('<'))) {
          return true;
        }
        
        // Try to parse JSON data for visual mode
        const parsedData = JSON.parse(item.code || "{}");
        return parsedData.isMathEquation === true;
      } catch (e) {
        // If not valid JSON and doesn't contain programming language syntax, assume it's a math equation
        const codeString = item.code || "";
        const containsProgrammingSyntax = 
          codeString.includes('function') || 
          codeString.includes('class') || 
          codeString.includes('const') || 
          codeString.includes('let') || 
          codeString.includes('var') ||
          codeString.includes('import') || 
          codeString.includes('export');
        
        return !containsProgrammingSyntax;
      }
    });

    return NextResponse.json(filteredMathEquations);
  } catch (error) {
    console.log("[MATH_EQUATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ courseId: string; chapterId: string; sectionId: string }> }
) {
  const params = await props.params;
  try {
    const user = await currentUser();
    const { title, equation, explanation, imageUrl, content, mode } = await req.json();

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sectionOwner = await db.section.findUnique({
      where: {
        id: params.sectionId,
        chapter: {
          courseId: params.courseId
        }
      }
    });

    if (!sectionOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Prepare the data to be stored
    let codeData;
    let explanationData;
    
    if (mode === "visual") {
      // Store visual mode data as JSON in the code field
      codeData = JSON.stringify({
        isMathEquation: true,
        mode: "visual",
        imageUrl: imageUrl || "",
        content: content || ""
      });
      
      // Use content or explanation as the explanation
      explanationData = content || explanation || "";
    } else {
      // For equation mode, store LaTeX directly
      codeData = equation;
      explanationData = explanation;
    }

    // Since we don't have a MathEquation model yet, we'll create a CodeExplanation
    const mathEquation = await db.codeExplanation.create({
      data: {
        heading: title,
        code: codeData,       // Store the equation or JSON data
        explanation: explanationData,
        sectionId: params.sectionId,
      }
    });

    return NextResponse.json(mathEquation);
  } catch (error) {
    console.log("[MATH_EQUATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 