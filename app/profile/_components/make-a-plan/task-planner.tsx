"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Clock, 
  Calendar,
  Tag,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Timer,
  Circle,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  createdAt: Date;
};

interface TaskPlannerProps {
  userId: string;
}

export function TaskPlanner({ userId }: TaskPlannerProps) {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  
  // This would be replaced with real data from an API
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete course outline",
      description: "Create detailed outline for new web development course",
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      priority: 'high',
      category: "Course Planning",
      completed: false,
      createdAt: new Date()
    },
    {
      id: "2",
      title: "Record intro video",
      description: "Create introduction video for the course",
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      priority: 'medium',
      category: "Content Creation",
      completed: false,
      createdAt: new Date()
    },
    {
      id: "3",
      title: "Design slides for module 1",
      description: "Create presentation slides for the first module",
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      priority: 'medium',
      category: "Content Creation",
      completed: true,
      createdAt: new Date(Date.now() - 86400000) // 1 day ago
    }
  ]);
  
  // Categories for tasks
  const categories = [
    "Course Planning", 
    "Content Creation", 
    "Research", 
    "Marketing", 
    "Admin", 
    "Personal"
  ];
  
  // Filter tasks based on the selected tab
  const filteredTasks = tasks.filter(task => {
    if (selectedTab === "all") return true;
    if (selectedTab === "completed") return task.completed;
    if (selectedTab === "due-today") {
      const today = new Date();
      return (
        !task.completed && 
        task.dueDate.getDate() === today.getDate() &&
        task.dueDate.getMonth() === today.getMonth() &&
        task.dueDate.getFullYear() === today.getFullYear()
      );
    }
    if (selectedTab === "upcoming") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return !task.completed && task.dueDate > today;
    }
    if (selectedTab === "overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return !task.completed && task.dueDate < today;
    }
    return true;
  });
  
  // New task form state
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
    category: "Course Planning",
    completed: false
  });
  
  // Add a new task
  const handleAddTask = () => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      dueDate: new Date(),
      priority: "medium",
      category: "Course Planning",
      completed: false
    });
    setIsNewTaskOpen(false);
  };
  
  // Toggle task completion
  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Get priority color
  const getPriorityColor = (priority: string, isBackground = false) => {
    switch (priority) {
      case 'high':
        return isBackground ? 'bg-red-100 dark:bg-red-900/30' : 'text-red-600 dark:text-red-400';
      case 'medium':
        return isBackground ? 'bg-amber-100 dark:bg-amber-900/30' : 'text-amber-600 dark:text-amber-400';
      default:
        return isBackground ? 'bg-blue-100 dark:bg-blue-900/30' : 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Tabs & Add Button */}
      <div className="flex justify-between items-center">
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="bg-white/20 dark:bg-gray-900/20 p-1 h-auto">
            <TabsTrigger 
              value="all"
              className={cn(
                "text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
              )}
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="due-today"
              className={cn(
                "text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
              )}
            >
              Due Today
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className={cn(
                "text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
              )}
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="overdue"
              className={cn(
                "text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
              )}
            >
              Overdue
            </TabsTrigger>
            <TabsTrigger 
              value="completed"
              className={cn(
                "text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800",
                "data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100",
                "data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400"
              )}
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Task Title
                </label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="border-gray-300 dark:border-gray-700"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details about this task..."
                  className="border-gray-300 dark:border-gray-700 min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="due-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <input
                      type="date"
                      id="due-date"
                      value={format(newTask.dueDate, 'yyyy-MM-dd')}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setNewTask({ ...newTask, dueDate: date });
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
                  <label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <Select 
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ 
                      ...newTask, 
                      priority: value as 'low' | 'medium' | 'high' 
                    })}
                  >
                    <SelectTrigger className="border-gray-300 dark:border-gray-700">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <span>Low</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          <span>High</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <Select 
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger className="border-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsNewTaskOpen(false)}
                className="border-gray-300 dark:border-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddTask} 
                disabled={!newTask.title || !newTask.dueDate}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-6 text-center">
              <div className="rounded-full mx-auto bg-gray-100 dark:bg-gray-700 w-12 h-12 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No tasks found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {selectedTab === "all" 
                  ? "Create your first task to get started" 
                  : `No tasks in "${selectedTab}" category`}
              </p>
              {selectedTab !== "all" && (
                <Button 
                  variant="link" 
                  className="mt-2 text-blue-600 dark:text-blue-400 p-0 h-auto"
                  onClick={() => setSelectedTab("all")}
                >
                  View all tasks
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={cn(
                  "bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700",
                  task.completed && "bg-gray-50/60 dark:bg-gray-900/60"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                        className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <label 
                            htmlFor={`task-${task.id}`}
                            className={cn(
                              "font-medium cursor-pointer",
                              task.completed 
                                ? "text-gray-400 dark:text-gray-500 line-through" 
                                : "text-gray-800 dark:text-gray-200"
                            )}
                          >
                            {task.title}
                          </label>
                          <div className={cn(
                            "ml-2 text-xs px-2 py-0.5 rounded-full",
                            getPriorityColor(task.priority, true),
                            getPriorityColor(task.priority)
                          )}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className={cn(
                            "text-sm",
                            task.completed 
                              ? "text-gray-400 dark:text-gray-500" 
                              : "text-gray-600 dark:text-gray-400"
                          )}>
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                            <span className={
                              new Date() > task.dueDate && !task.completed
                                ? "text-red-600 dark:text-red-400 font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            }>
                              {format(task.dueDate, 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Tag className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {task.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center"
                          onClick={() => {
                            // This would open the edit task modal
                            console.log("Edit task", task.id);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center text-red-600 focus:text-red-600"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 