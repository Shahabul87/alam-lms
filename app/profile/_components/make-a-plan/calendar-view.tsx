"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Tag,
  Users,
  AlertCircle,
  Check
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays } from "date-fns";

type EventType = 'course' | 'meeting' | 'deadline' | 'personal';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: EventType;
  attendees?: string[];
}

interface CalendarViewProps {
  userId: string;
}

export function CalendarView({ userId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);
  
  // Demo events
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Record Module 2 Videos",
      description: "Record all videos for module 2 of the web development course",
      date: new Date(),
      startTime: "10:00",
      endTime: "12:00",
      type: "course"
    },
    {
      id: "2",
      title: "Team Planning Meeting",
      description: "Weekly team meeting to discuss progress and next steps",
      date: addDays(new Date(), 2),
      startTime: "14:00",
      endTime: "15:00",
      location: "Zoom Call",
      type: "meeting",
      attendees: ["John", "Sarah", "Mike"]
    },
    {
      id: "3",
      title: "Course Outline Deadline",
      description: "Submit final course outline to the platform",
      date: addDays(new Date(), 5),
      type: "deadline"
    }
  ]);
  
  // New event form state
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: "",
    description: "",
    date: selectedDate || new Date(),
    type: "course"
  });
  
  // Get days for the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });
  
  // Add events to a date
  const addEvent = () => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString()
    };
    
    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: selectedDate || new Date(),
      type: "course"
    });
    setIsNewEventOpen(false);
  };
  
  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };
  
  // Get color for event type
  const getEventColor = (type: EventType) => {
    switch (type) {
      case "course":
        return "bg-blue-500 dark:bg-blue-600";
      case "meeting":
        return "bg-purple-500 dark:bg-purple-600";
      case "deadline":
        return "bg-red-500 dark:bg-red-600";
      case "personal":
        return "bg-green-500 dark:bg-green-600";
      default:
        return "bg-gray-500 dark:bg-gray-600";
    }
  };
  
  // Get text for event type
  const getEventTypeText = (type: EventType) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="border-gray-300 dark:border-gray-700"
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const prevMonth = new Date(currentDate);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentDate(prevMonth);
            }}
            className="border-gray-300 dark:border-gray-700"
          >
            &lt;
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const nextMonth = new Date(currentDate);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentDate(nextMonth);
            }}
            className="border-gray-300 dark:border-gray-700"
          >
            &gt;
          </Button>
          <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 shadow-sm"
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate || new Date() }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Title
                  </label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                    className="border-gray-300 dark:border-gray-700"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Enter event description"
                    className="border-gray-300 dark:border-gray-700 min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <input
                        type="date"
                        id="date"
                        value={format(new Date(newEvent.date), 'yyyy-MM-dd')}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setNewEvent({ ...newEvent, date });
                        }}
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          "border-gray-300 dark:border-gray-700"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="start-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time
                    </label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <input
                        type="time"
                        id="start-time"
                        value={newEvent.startTime || ""}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, startTime: e.target.value });
                        }}
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          "border-gray-300 dark:border-gray-700"
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="end-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time
                    </label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <input
                        type="time"
                        id="end-time"
                        value={newEvent.endTime || ""}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, endTime: e.target.value });
                        }}
                        className={cn(
                          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          "border-gray-300 dark:border-gray-700"
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location (Optional)
                    </label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input
                        id="location"
                        value={newEvent.location || ""}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Enter location"
                        className="border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Event Type
                    </label>
                    <Select 
                      value={newEvent.type}
                      onValueChange={(value) => setNewEvent({ 
                        ...newEvent, 
                        type: value as EventType 
                      })}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-700">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsNewEventOpen(false)}
                  className="border-gray-300 dark:border-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addEvent} 
                  disabled={!newEvent.title || !newEvent.date}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
        {/* Day labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div 
            key={day} 
            className="text-center font-medium text-sm text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {daysInMonth.map((day, i) => {
          // Calculate the offset for the first week of the month
          const startDay = startOfMonth(currentDate).getDay();
          const dayEvents = getEventsForDate(day);
          
          if (i === 0) {
            // Add empty cells for days before the first of the month
            const emptyDays = Array.from({ length: startDay }, (_, index) => (
              <div 
                key={`empty-${index}`} 
                className="p-2 h-32 bg-gray-50/50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-800"
              />
            ));
            
            return [
              ...emptyDays,
              <div 
                key={day.toString()} 
                className={cn(
                  "p-2 h-32 flex flex-col rounded border border-gray-100 dark:border-gray-800 cursor-pointer transition-colors",
                  !isSameMonth(day, currentDate) && "bg-gray-50/70 dark:bg-gray-900/70",
                  isToday(day) && "bg-blue-50/70 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                  selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-blue-500 dark:ring-blue-700",
                )}
                onClick={() => {
                  setSelectedDate(day);
                  if (dayEvents.length === 0) {
                    setNewEvent(prev => ({ ...prev, date: day }));
                    setIsNewEventOpen(true);
                  }
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <div 
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                      isToday(day) && "bg-blue-500 text-white"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  {dayEvents.length > 0 && (
                    <Badge className="bg-blue-500/70 dark:bg-blue-600/70 hover:bg-blue-600 text-xs h-5">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 overflow-y-auto flex-grow">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div 
                      key={event.id} 
                      className={cn(
                        "text-xs p-1 rounded text-white truncate",
                        getEventColor(event.type)
                      )}
                    >
                      {event.startTime && <span className="mr-1">{event.startTime}</span>}
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ];
          }
          
          return (
            <div 
              key={day.toString()} 
              className={cn(
                "p-2 h-32 flex flex-col rounded border border-gray-100 dark:border-gray-800 cursor-pointer transition-colors",
                !isSameMonth(day, currentDate) && "bg-gray-50/70 dark:bg-gray-900/70",
                isToday(day) && "bg-blue-50/70 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-blue-500 dark:ring-blue-700",
              )}
              onClick={() => {
                setSelectedDate(day);
                if (dayEvents.length === 0) {
                  setNewEvent(prev => ({ ...prev, date: day }));
                  setIsNewEventOpen(true);
                }
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <div 
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-sm",
                    isToday(day) && "bg-blue-500 text-white"
                  )}
                >
                  {format(day, 'd')}
                </div>
                {dayEvents.length > 0 && (
                  <Badge className="bg-blue-500/70 dark:bg-blue-600/70 hover:bg-blue-600 text-xs h-5">
                    {dayEvents.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 overflow-y-auto flex-grow">
                {dayEvents.slice(0, 3).map((event) => (
                  <div 
                    key={event.id} 
                    className={cn(
                      "text-xs p-1 rounded text-white truncate",
                      getEventColor(event.type)
                    )}
                  >
                    {event.startTime && <span className="mr-1">{event.startTime}</span>}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Selected Day Events */}
      {selectedDate && (
        <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Events for {format(selectedDate, 'MMMM d, yyyy')}
              {isToday(selectedDate) && (
                <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">Today</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-6">
                <div className="rounded-full mx-auto bg-gray-100 dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-3">
                  <CalendarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">No events</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  There are no events scheduled for this day
                </p>
                <Button
                  onClick={() => {
                    setNewEvent(prev => ({ ...prev, date: selectedDate }));
                    setIsNewEventOpen(true);
                  }}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Badge className={cn(
                        "text-white",
                        getEventColor(event.type)
                      )}>
                        {getEventTypeText(event.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-3">
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.startTime && event.endTime 
                            ? `${event.startTime} - ${event.endTime}`
                            : event.startTime || event.endTime
                          }
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 