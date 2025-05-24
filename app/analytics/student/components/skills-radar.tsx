"use client";

import { Card } from "@/components/ui/card";
import { RadarChart } from "./charts";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Target } from "lucide-react";

interface Skill {
  skill: string;
  value: number;
}

interface SkillsRadarProps {
  skills: Skill[];
}

export function SkillsRadar({ skills }: SkillsRadarProps) {
  // Sort skills by proficiency level (descending)
  const sortedSkills = [...skills].sort((a, b) => b.value - a.value);
  
  // Identify strengths and areas for improvement
  const strengths = sortedSkills.filter(skill => skill.value >= 75);
  const improvements = sortedSkills.filter(skill => skill.value < 60);
  
  // Prepare chart data
  const chartData = {
    labels: skills.map(skill => skill.skill),
    datasets: [{
      label: 'Proficiency',
      data: skills.map(skill => skill.value),
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      borderColor: 'rgb(14, 165, 233)'
    }]
  };
  
  // Helper function to determine skill level category
  const getSkillLevel = (value: number) => {
    if (value >= 90) return { label: "Expert", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (value >= 75) return { label: "Advanced", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" };
    if (value >= 60) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    if (value >= 40) return { label: "Basic", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" };
    return { label: "Beginner", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
          <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Skills Proficiency Map</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visual representation of your skill levels across different areas
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <RadarChart data={chartData} />
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Your Strengths
            </h3>
            <div className="space-y-3">
              {strengths.length > 0 ? (
                strengths.map((skill, index) => (
                  <SkillItem 
                    key={index} 
                    name={skill.skill} 
                    value={skill.value} 
                    level={getSkillLevel(skill.value)} 
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">Keep working to develop your strengths!</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {improvements.length > 0 ? (
                improvements.map((skill, index) => (
                  <SkillItem 
                    key={index} 
                    name={skill.skill} 
                    value={skill.value} 
                    level={getSkillLevel(skill.value)} 
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">Great job! You're performing well in all areas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-medium mb-3">All Skills</h3>
        <div className="flex flex-wrap gap-3">
          {sortedSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <span className="text-sm font-medium">{skill.skill}</span>
              <Badge className={getSkillLevel(skill.value).color}>
                {skill.value}%
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface SkillItemProps {
  name: string;
  value: number;
  level: {
    label: string;
    color: string;
  };
}

function SkillItem({ name, value, level }: SkillItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium">{name}</span>
        <div className="mt-1">
          <Badge className={level.color}>
            {level.label}
          </Badge>
        </div>
      </div>
      <span className="text-xl font-bold">{value}%</span>
    </div>
  );
} 