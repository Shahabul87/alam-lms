import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email"; // You would need to implement this function

export async function GET(req: Request) {
  try {
    // Verify this is an authorized request
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get("apiKey");
    
    // Check API key - you would need to store this securely in your environment variables
    if (!apiKey || apiKey !== process.env.CRON_API_KEY) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Find all tasks that have reminders set, haven't been sent yet, and are due soon
    const now = new Date();
    const tasksWithDueReminders = await db.task.findMany({
      where: {
        hasReminder: true,
        reminderSent: false,
        reminderDate: {
          lte: now // Reminder time is now or has passed
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    const results = [];
    
    // Process each reminder
    for (const task of tasksWithDueReminders) {
      try {
        // Based on the reminder type, send the appropriate notification
        if (task.reminderType === "email" && task.user.email) {
          // Send email reminder
          await sendEmail({
            to: task.user.email,
            subject: `Reminder: ${task.title}`,
            text: `You have a task due on ${task.dueDate.toLocaleDateString()}: ${task.title}${task.description ? `\n\n${task.description}` : ''}`,
            html: `
              <h2>Task Reminder</h2>
              <p>You have a task due on <strong>${task.dueDate.toLocaleDateString()}</strong>:</p>
              <h3>${task.title}</h3>
              ${task.description ? `<p>${task.description}</p>` : ''}
              <p>Priority: ${task.priority}</p>
              <p>Category: ${task.category}</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/profile">View in your dashboard</a></p>
            `
          });
        }
        
        // Update the task to mark the reminder as sent
        await db.task.update({
          where: { id: task.id },
          data: { reminderSent: true }
        });
        
        // Record successful processing
        results.push({
          taskId: task.id,
          userId: task.userId,
          reminderType: task.reminderType,
          status: "sent"
        });
      } catch (error) {
        console.error(`Error processing reminder for task ${task.id}:`, error);
        results.push({
          taskId: task.id,
          userId: task.userId,
          reminderType: task.reminderType,
          status: "error",
          error: (error as Error).message
        });
      }
    }
    
    return NextResponse.json({
      processed: tasksWithDueReminders.length,
      results
    });
  } catch (error) {
    console.error("[TASK_REMINDERS_CRON]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 