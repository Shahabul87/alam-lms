import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CalendarSync } from "@/app/calendar/_lib/calendar-sync";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { provider, action, eventId } = await req.json();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const account = user.accounts.find(acc => acc.provider === provider);
    if (!account) {
      return new NextResponse("Provider account not found", { status: 404 });
    }

    const calendarSync = new CalendarSync({
      access_token: account.access_token || '',
      refresh_token: account.refresh_token || '',
      expiry_date: account.expires_at ? account.expires_at * 1000 : null,
    });

    // Handle different sync actions
    if (action === 'import') {
      // Import events from Google Calendar (existing functionality)
      const externalEvents = await calendarSync.syncWithGoogle();

      if (!externalEvents) {
        return NextResponse.json({ success: false, message: "No events to sync" });
      }

      // Sync events to database
      for (const event of externalEvents) {
        await db.calendarEvent.upsert({
          where: {
            externalId_source: {
              externalId: event.externalId || '',
              source: event.source || '',
            },
          },
          update: {
            title: event.title || '',
            description: event.description || null,
            startDate: new Date(event.startDate || ''),
            endDate: new Date(event.endDate || ''),
            location: event.location || null,
            allDay: !!event.isAllDay,
            source: event.source,
            externalId: event.externalId || '',
            lastSync: new Date(),
          },
          create: {
            title: event.title || '',
            description: event.description || null,
            startDate: new Date(event.startDate || ''),
            endDate: new Date(event.endDate || ''),
            location: event.location || null,
            allDay: !!event.isAllDay,
            source: event.source,
            externalId: event.externalId || '',
            userId: session.user.id,
            category: 'General',
            lastSync: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true, message: "Events imported from Google Calendar" });
    } 
    else if (action === 'export' && eventId) {
      // Export a specific event to Google Calendar
      const event = await db.calendarEvent.findUnique({
        where: {
          id: eventId,
          userId: session.user.id,
        },
      });

      if (!event) {
        return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
      }

      // Export to Google Calendar
      const googleEvent = await calendarSync.exportToGoogle({
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        isAllDay: event.allDay,
      });

      // Update the event with the external ID
      await db.calendarEvent.update({
        where: { id: eventId },
        data: {
          externalId: googleEvent.id,
          source: 'google',
          lastSync: new Date(),
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Event exported to Google Calendar",
        data: { externalId: googleEvent.id }
      });
    }
    else if (action === 'update' && eventId) {
      // Update an event that already exists in Google Calendar
      const event = await db.calendarEvent.findUnique({
        where: {
          id: eventId,
          userId: session.user.id,
        },
      });

      if (!event || !event.externalId) {
        return NextResponse.json({ success: false, message: "Event not found or not synced yet" }, { status: 404 });
      }

      // Update the event in Google Calendar
      await calendarSync.updateGoogleEvent(event.externalId, {
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        location: event.location,
        isAllDay: event.allDay,
      });

      // Update sync timestamp
      await db.calendarEvent.update({
        where: { id: eventId },
        data: { lastSync: new Date() },
      });

      return NextResponse.json({ success: true, message: "Event updated in Google Calendar" });
    }
    else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[CALENDAR_SYNC]", error);
    return new NextResponse(
      "Internal Error", 
      { status: 500 }
    );
  }
} 