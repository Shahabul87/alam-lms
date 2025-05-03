import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { Editor } from '@monaco-editor/react';
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { ImageIcon, Code2, Plus, Trash, ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const languageOptions = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
];

interface CodeBlock {
  id: string;
  code: string;
  explanation: string;
  language: string;
}

interface ExplanationFormFieldsProps {
  form: UseFormReturn<{
    heading: string;
    code: string;
    explanation: string;
  }>;
  isSubmitting: boolean;
}

// Fix the useLocalStorage hook to properly handle errors and avoid JSON parsing issues
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Check if the item exists
      if (!item) {
        return initialValue;
      }
      
      try {
        // Parse stored json or return initialValue if invalid
        return JSON.parse(item);
      } catch {
        // If JSON parsing fails, remove the invalid item and return initial value
        window.localStorage.removeItem(key);
        console.warn(`Invalid JSON in localStorage for key: ${key}, using default value`);
        return initialValue;
      }
    } catch (error) {
      // If error or can't access localStorage, return initialValue
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      
      // Save to local storage as long as we're in a browser environment
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

// Improve the extractImageUrl function to handle more cases
const extractImageUrl = (text: string): string | null => {
  if (!text) return null;
  
  // Match Markdown image format: ![alt text](url)
  const markdownMatch = text.match(/!\[.*?\]\((.*?)\)/);
  if (markdownMatch && markdownMatch[1]) return markdownMatch[1];
  
  // Also match HTML image format: <img src="url" />
  const htmlMatch = text.match(/<img.*?src=["'](.*?)["']/);
  if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
  
  return null;
};

const isImageMarkdown = (text: string): boolean => {
  if (!text) return false;
  
  // Check for both markdown and HTML image formats
  return /!\[.*?\]\(.*?\)/.test(text) || /<img.*?src=["'].*?["']/.test(text);
};

// Add this helper function for generating unique IDs
const generateId = () => `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const ExplanationFormFields = ({ form, isSubmitting }: ExplanationFormFieldsProps) => {
  // Use local storage to persist code blocks
  const [codeBlocks, setCodeBlocks] = useLocalStorage<CodeBlock[]>('explanation-code-blocks', [
    { id: generateId(), code: '', explanation: '', language: 'typescript' }
  ]);
  
  // Store the form heading in local storage too
  const [storedHeading, setStoredHeading] = useLocalStorage<string>('explanation-heading', '');
  
  // Add state for image dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [activeImageBlockId, setActiveImageBlockId] = useState('');
  
  // Track if this is the first load
  const initializedRef = useRef(false);
  
  // Initialize form with stored heading if available
  useEffect(() => {
    if (!initializedRef.current && storedHeading) {
      form.setValue('heading', storedHeading);
      initializedRef.current = true;
    }
  }, [form, storedHeading]);
  
  // Update stored heading when it changes in the form
  const watchHeading = form.watch('heading');
  useEffect(() => {
    if (watchHeading !== undefined) {
      setStoredHeading(watchHeading);
    }
  }, [watchHeading, setStoredHeading]);
  
  const [activeBlockId, setActiveBlockId] = useState(codeBlocks[0]?.id || '');
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  // Clear local storage when form is submitted successfully
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear on successful submission
      if (form.formState.isSubmitSuccessful) {
        localStorage.removeItem('explanation-code-blocks');
        localStorage.removeItem('explanation-heading');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form.formState.isSubmitSuccessful]);

  // Combine all code and explanations for form submission
  useEffect(() => {
    const combinedCode = codeBlocks.map(block => {
      // Check if this is an image block
      if (isImageMarkdown(block.code)) {
        // For image blocks, use the markdown format directly
        return block.code;
      } else {
        // For code blocks, use the standard format
        return block.code;
      }
    }).join('\n\n// Next Code Block\n\n');
    
    const combinedExplanation = codeBlocks.map(block => block.explanation).join('\n\n<hr />\n\n');
    
    form.setValue('code', combinedCode);
    form.setValue('explanation', combinedExplanation);
  }, [codeBlocks, form]);

  const updateBlockCode = (id: string, code: string) => {
    setCodeBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, code } : block
    ));
  };

  const updateBlockExplanation = (id: string, explanation: string) => {
    setCodeBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, explanation } : block
    ));
  };

  const updateBlockLanguage = (id: string, language: string) => {
    setCodeBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, language } : block
    ));
  };

  const addCodeBlock = () => {
    const newId = generateId();
    setCodeBlocks(prev => [...prev, { 
      id: newId, 
      code: '', 
      explanation: '', 
      language: 'typescript' 
    }]);
    setActiveBlockId(newId);
  };

  const removeCodeBlock = (id: string) => {
    if (codeBlocks.length <= 1) return;
    
    setCodeBlocks(prev => prev.filter(block => block.id !== id));
    
    // If removing active block, set a new active block
    if (activeBlockId === id) {
      const remainingBlocks = codeBlocks.filter(block => block.id !== id);
      if (remainingBlocks.length > 0) {
        setActiveBlockId(remainingBlocks[0].id);
      }
    }
  };
  
  const moveBlockUp = (id: string) => {
    setCodeBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index <= 0) return prev;
      
      const newBlocks = [...prev];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index - 1];
      newBlocks[index - 1] = temp;
      
      return newBlocks;
    });
  };
  
  const moveBlockDown = (id: string) => {
    setCodeBlocks(prev => {
      const index = prev.findIndex(block => block.id === id);
      if (index >= prev.length - 1) return prev;
      
      const newBlocks = [...prev];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + 1];
      newBlocks[index + 1] = temp;
      
      return newBlocks;
    });
  };

  // Add the missing addImageDialog function
  const addImageDialog = (blockId: string) => {
    setActiveImageBlockId(blockId);
    setImageUrl('');
    setIsDialogOpen(true);
  };
  
  // Add handleAddImage function for the dialog confirmation
  const handleAddImage = () => {
    if (imageUrl && activeImageBlockId) {
      // Add image markdown to the code block
      updateBlockCode(activeImageBlockId, `![](${imageUrl})`);
      setIsDialogOpen(false);
    } else {
      toast.error('Please enter a valid image URL');
    }
  };

  return (
    <div className="w-full space-y-6">
      <FormField
        control={form.control}
        name="heading"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold text-gray-700 dark:text-gray-300">
              Explanation Title
            </FormLabel>
            <FormControl>
              <Input
                placeholder="E.g., Understanding React Hooks"
                {...field}
                disabled={isSubmitting}
                className="focus-visible:ring-indigo-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-white dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-1 overflow-x-auto">
            {codeBlocks.map((block, index) => (
              <Button
                key={block.id}
                type="button"
                variant={activeBlockId === block.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveBlockId(block.id)}
                className={cn(
                  "rounded-full whitespace-nowrap",
                  activeBlockId === block.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <span className="text-xs">Block {index + 1}</span>
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addCodeBlock}
              className="text-indigo-600 dark:text-indigo-400 rounded-full"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="text-xs">Add</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'edit' | 'preview')}>
              <TabsList className="grid grid-cols-2 h-8 w-[140px]">
                <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="p-4">
          {mode === 'edit' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Code editor panel */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Code2 className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Block</span>
                  </div>
                  
                  {codeBlocks.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlockUp(activeBlockId)}
                        disabled={isSubmitting || codeBlocks.findIndex(b => b.id === activeBlockId) === 0}
                        className="h-8 w-8 p-0 text-gray-500"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveBlockDown(activeBlockId)}
                        disabled={isSubmitting || codeBlocks.findIndex(b => b.id === activeBlockId) === codeBlocks.length - 1}
                        className="h-8 w-8 p-0 text-gray-500"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCodeBlock(activeBlockId)}
                        disabled={isSubmitting || codeBlocks.length <= 1}
                        className="h-8 w-8 p-0 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {codeBlocks.map((block) => {
                  const isActive = block.id === activeBlockId;
                  
                  return (
                    <div key={block.id} className={cn("space-y-4", isActive ? "block" : "hidden")}>
                      <div className="flex items-center justify-between">
                        <Select
                          value={block.language}
                          onValueChange={(value) => updateBlockLanguage(block.id, value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-[180px] h-8 text-xs focus:ring-indigo-500">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {languageOptions.map(option => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addImageDialog(block.id)}
                          disabled={isSubmitting}
                          className="h-8 text-xs text-indigo-600 dark:text-indigo-400"
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-1" />
                          Add Image
                        </Button>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                        <Editor
                          height="300px"
                          language={block.language}
                          value={block.code}
                          onChange={(value) => updateBlockCode(block.id, value || '')}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            tabSize: 2,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation editor panel */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400">
                    <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Explanation</span>
                </div>
                
                {codeBlocks.map((block) => {
                  const isActive = block.id === activeBlockId;
                  
                  return (
                    <div key={block.id} className={cn(isActive ? "block" : "hidden")}>
                      <ExplanationEditor
                        content={block.explanation}
                        onUpdate={(html) => updateBlockExplanation(block.id, html)}
                        isSubmitting={isSubmitting}
                        blockId={block.id}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview mode */}
              <div className="prose prose-indigo dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{watchHeading}</h1>
              </div>

              {codeBlocks.map((block, index) => (
                <div key={block.id} className="space-y-4">
                  {index > 0 && <hr className="border-gray-200 dark:border-gray-700" />}
                  
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    {isImageMarkdown(block.code) ? (
                      <div className="p-4 flex justify-center">
                        <div className="max-w-full">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                          >
                            {block.code}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="border-b border-gray-200 dark:border-gray-700">
                        <Editor
                          height="200px"
                          language={block.language}
                          value={block.code}
                          theme="vs-dark"
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                          }}
                        />
                      </div>
                    )}
                  
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                      <ReactMarkdown
                        className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300"
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {block.explanation}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image URL Dialog */}
      <ImageUrlDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleAddImage}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

// Enhance the ExplanationEditor component to properly handle image insertion
const ExplanationEditor = ({
  content,
  onUpdate,
  isSubmitting,
  blockId
}: {
  content: string;
  onUpdate: (html: string) => void;
  isSubmitting: boolean;
  blockId: string;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full mx-auto',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editable: !isSubmitting,
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (!file.type.startsWith('image/')) {
            return false;
          }
          
          // Handle image drop directly
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const formData = new FormData();
            formData.append('file', file);
            
            // Show a temporary placeholder using base64
            if (readerEvent.target?.result) {
              const base64Image = readerEvent.target.result.toString();
              editor.chain().focus().setImage({ src: base64Image }).run();
              
              // Then upload and replace with the actual URL
              fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error('Upload failed');
                }
                return response.json();
              })
              .then(data => {
                if (data.uploadedFiles && data.uploadedFiles.length > 0) {
                  // Find the base64 image and replace it
                  const imageUrl = data.uploadedFiles[0].url;
                  const images = editor.view.dom.querySelectorAll('img[src^="data:image"]');
                  if (images.length > 0) {
                    const lastImage = images[images.length - 1];
                    lastImage.setAttribute('src', imageUrl);
                    toast.success("Image uploaded successfully!");
                  }
                }
              })
              .catch(error => {
                console.error(error);
                toast.error("Image upload failed");
              });
            }
          };
          reader.readAsDataURL(file);
          
          return true;
        }
        return false;
      },
    },
  });

  // Add this safeguard
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {editor && <TipTapMenuBar editor={editor} blockId={blockId} />}
      <div className="h-[260px] overflow-y-auto relative">
        <EditorContent
          editor={editor}
          className={cn(
            "h-full p-4",
            "prose dark:prose-invert max-w-none",
            "focus:outline-none"
          )}
        />
        {!editor?.getText().trim() && !isSubmitting && (
          <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none text-gray-400 dark:text-gray-600">
            <p>Write your explanation here or drag and drop images...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhance the TipTapMenuBar to use our improved image upload
const TipTapMenuBar = ({ editor, blockId }: { editor: any, blockId: string }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useUpload, setUseUpload] = useState(true);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    // Directly trigger file upload instead of showing dialog
    document.getElementById(`explanationImageUpload-${blockId}`)?.click();
  };

  const handleImageUploadSuccess = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Image added to explanation");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Bold"
        >
          <span className="font-bold">B</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Italic"
        >
          <span className="italic">I</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
          )}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </button>
        <button
          onClick={addImage}
          className={cn(
            "p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700",
            "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30"
          )}
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </button>
      </div>

      {/* Hidden file input for TipTap toolbar image uploads */}
      <input
        type="file"
        id={`explanationImageUpload-${blockId}`}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            
            fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            .then(response => {
              if (!response.ok) throw new Error('Upload failed');
              return response.json();
            })
            .then(data => {
              if (data.uploadedFiles && data.uploadedFiles.length > 0) {
                const imageUrl = data.uploadedFiles[0].url;
                handleImageUploadSuccess(imageUrl);
              }
            })
            .catch(error => {
              toast.error('Failed to upload image');
              console.error(error);
            })
            .finally(() => {
              setIsLoading(false);
              e.target.value = '';
            });
          }
        }}
      />
    </>
  );
};

// Create the ImageUrlDialog component
interface ImageUrlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  isSubmitting: boolean;
}

const ImageUrlDialog = ({
  isOpen,
  onClose,
  onConfirm,
  imageUrl,
  setImageUrl,
  isSubmitting
}: ImageUrlDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>
            Enter the URL of the image you want to add
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Image URL
            </label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          {imageUrl && (
            <div className="mt-2 rounded-md border border-gray-200 dark:border-gray-700 p-2 overflow-hidden">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-32 max-w-full mx-auto"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!imageUrl.trim() || isSubmitting}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 