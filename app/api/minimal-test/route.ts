export async function GET() {
  return Response.json({
    status: "working",
    timestamp: new Date().toISOString()
  });
} 