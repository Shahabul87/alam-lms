"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const learningStyles = [
  {
    value: "visual",
    label: "Visual Learner",
    description: "Learn through diagrams, charts, and visual examples"
  },
  {
    value: "auditory",
    label: "Auditory Learner",
    description: "Learn through spoken explanations and discussion"
  },
  {
    value: "reading",
    label: "Reading/Writing",
    description: "Learn through written materials and note-taking"
  },
  {
    value: "kinesthetic",
    label: "Kinesthetic Learner",
    description: "Learn through hands-on activities and practical examples"
  },
  {
    value: "socratic",
    label: "Socratic Method",
    description: "Learn through guided questioning and critical thinking"
  },
  {
    value: "structured",
    label: "Structured Learning",
    description: "Learn through organized, step-by-step instruction"
  },
  {
    value: "exploratory",
    label: "Exploratory Learning",
    description: "Learn through exploration and discovery"
  },
];

interface LearningStyleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export const LearningStyleSelector = ({
  value,
  onValueChange,
  className,
}: LearningStyleSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedStyle = learningStyles.find(style => style.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedStyle?.label || "Select learning style..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search learning style..." />
          <CommandEmpty>No learning style found.</CommandEmpty>
          <CommandGroup>
            {learningStyles.map((style) => (
              <CommandItem
                key={style.value}
                value={style.value}
                onSelect={(currentValue) => {
                  onValueChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === style.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{style.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {style.description}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 