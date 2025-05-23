"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LearningStyleSelector } from "./learning-style-selector";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  subject?: string;
  onSubjectChange?: (subject: string) => void;
  learningStyle?: string;
  onLearningStyleChange?: (style: string) => void;
}

export const SettingsDialog = ({
  open,
  onClose,
  subject = "",
  onSubjectChange = () => {},
  learningStyle = "",
  onLearningStyleChange = () => {}
}: SettingsDialogProps) => {
  const [localSubject, setLocalSubject] = useState(subject);
  const [localLearningStyle, setLocalLearningStyle] = useState(learningStyle);
  const [useMarkdown, setUseMarkdown] = useState(true);
  const [useCodeHighlighting, setUseCodeHighlighting] = useState(true);
  const [useLatex, setUseLatex] = useState(false);
  const [enableVoiceInput, setEnableVoiceInput] = useState(false);

  const handleSave = () => {
    onSubjectChange(localSubject);
    onLearningStyleChange(localLearningStyle);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        "bg-white dark:bg-gray-900",
        "border-gray-200 dark:border-gray-800"
      )}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-50">AI Tutor Settings</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Customize your learning experience with the AI tutor.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="preferences" className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Focus</Label>
              <Input
                id="subject"
                placeholder="e.g. Mathematics, Physics, Computer Science"
                value={localSubject}
                onChange={(e) => setLocalSubject(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The main subject you want to learn about. Leave blank for general knowledge.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Learning Style</Label>
              <LearningStyleSelector
                value={localLearningStyle}
                onValueChange={setLocalLearningStyle}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select the learning style that works best for you.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="markdown" className="block">Markdown Formatting</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable rich text formatting in responses
                </p>
              </div>
              <Switch
                id="markdown"
                checked={useMarkdown}
                onCheckedChange={setUseMarkdown}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="codeHighlighting" className="block">Code Highlighting</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Highlight syntax in code examples
                </p>
              </div>
              <Switch
                id="codeHighlighting"
                checked={useCodeHighlighting}
                onCheckedChange={setUseCodeHighlighting}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="latex" className="block">LaTeX Support</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Render mathematical equations (coming soon)
                </p>
              </div>
              <Switch
                id="latex"
                checked={useLatex}
                onCheckedChange={setUseLatex}
                disabled
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="voiceInput" className="block">Voice Input</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable voice input for questions (coming soon)
                </p>
              </div>
              <Switch
                id="voiceInput"
                checked={enableVoiceInput}
                onCheckedChange={setEnableVoiceInput}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelSelector">AI Model</Label>
              <select
                id="modelSelector"
                disabled
                className={cn(
                  "w-full px-3 py-2 rounded-md",
                  "border border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-800",
                  "text-gray-900 dark:text-gray-100",
                  "disabled:opacity-50"
                )}
              >
                <option value="claude-3-opus">Claude 3 Opus (Default)</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Model selection coming in a future update
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 