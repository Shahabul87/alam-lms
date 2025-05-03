"use client";

import { motion } from "framer-motion";
import { Code2, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface CodeBlock {
  code: string;
  explanation: string;
  language?: string;
}

interface DisplayExplanationsProps {
  items: {
    id: string;
    heading: string | null;
    code: string | null;
    explanation: string | null;
  }[];
  onCreateClick: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

// Helper function to parse code blocks
const parseCodeBlocks = (code: string | null, explanation: string | null): CodeBlock[] => {
  if (!code || !explanation) return [];
  
  const codeBlocks = code.split(/\/\/ Next Code Block\n\n/);
  const explanationBlocks = explanation.split(/<hr \/>/);
  
  return codeBlocks.map((code, index) => ({
    code: code.trim(),
    explanation: explanationBlocks[index] ? explanationBlocks[index].trim() : '',
    language: detectLanguage(code),
  }));
};

// Helper to detect code language
const detectLanguage = (code: string): string => {
  if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
  if (code.includes('import') && code.includes('from')) return 'typescript';
  if (code.includes('<div') || code.includes('</div>')) return 'html';
  if (code.includes('class') && code.includes('{')) return 'css';
  if (code.includes('def ') || code.includes('import ') && !code.includes('from')) return 'python';
  return 'typescript';
};

export const DisplayExplanations = ({ 
  items, 
  onCreateClick, 
  onEdit,
  onDelete 
}: DisplayExplanationsProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, number>>({});

  // Initialize expanded state for all items
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    const initialExpandedBlocks: Record<string, number> = {};
    
    items.forEach(item => {
      initialExpandedState[item.id] = false;
      initialExpandedBlocks[item.id] = 0; // Show first block by default
    });
    
    setExpandedItems(initialExpandedState);
    setExpandedBlocks(initialExpandedBlocks);
  }, [items]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await onDelete(id);
      toast.success("Explanation deleted successfully");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Code2 className="h-10 w-10 text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            No explanations yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-4">
            Add your first code explanation to help others understand the concepts better.
          </p>
          <Button
            onClick={onCreateClick}
            variant="ghost"
            className={cn(
              "bg-indigo-50 dark:bg-indigo-500/10",
              "text-indigo-700 dark:text-indigo-300",
              "hover:bg-indigo-100 dark:hover:bg-indigo-500/20",
              "hover:text-indigo-800 dark:hover:text-indigo-200",
              "transition-all duration-200"
            )}
          >
            Add explanation
          </Button>
        </div>
      ) : (
        items.map((item) => {
          const codeBlocks = parseCodeBlocks(item.code, item.explanation);
          const currentBlockIndex = expandedBlocks[item.id] || 0;
          const currentBlock = codeBlocks[currentBlockIndex] || { code: '', explanation: '' };
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-xl overflow-hidden",
                "bg-white dark:bg-gray-800",
                "border border-gray-200 dark:border-gray-700",
                "shadow-md hover:shadow-lg",
                "transition-all duration-200"
              )}
            >
              {/* Header with expand/collapse controls */}
              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                    {item.heading}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => toggleExpand(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {expandedItems[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={() => onEdit(item.id)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmModal 
                    onConfirm={() => handleDelete(item.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </ConfirmModal>
                </div>
              </div>
              
              {/* Block navigation (if multiple blocks) */}
              {codeBlocks.length > 1 && (
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Block {currentBlockIndex + 1} of {codeBlocks.length}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setExpandedBlocks(prev => ({
                        ...prev,
                        [item.id]: Math.max(0, (prev[item.id] || 0) - 1)
                      }))}
                      variant="outline"
                      size="sm"
                      disabled={currentBlockIndex === 0}
                      className="h-7"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setExpandedBlocks(prev => ({
                        ...prev,
                        [item.id]: Math.min(codeBlocks.length - 1, (prev[item.id] || 0) + 1)
                      }))}
                      variant="outline"
                      size="sm"
                      disabled={currentBlockIndex === codeBlocks.length - 1}
                      className="h-7"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Content area (always visible or collapsible based on expandedItems state) */}
              <div className={cn(
                "transition-all duration-300 ease-in-out",
                !expandedItems[item.id] && codeBlocks.length > 1 ? "max-h-[500px]" : ""
              )}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
                  {/* Code section - always visible, sticky on scroll */}
                  <div className="lg:sticky lg:top-4 lg:self-start h-full max-h-[500px] overflow-auto">
                    <div className="p-1 bg-gray-900 h-full">
                      <SyntaxHighlighter
                        language={currentBlock.language || "typescript"}
                        style={atomDark}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.25rem',
                          height: '100%',
                          minHeight: '200px',
                        }}
                        showLineNumbers
                      >
                        {currentBlock.code || '// No code available'}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {/* Explanation section - scrolls independently */}
                  <div className="p-4 overflow-auto max-h-[500px]">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          img: ({ node, ...props }) => (
                            <div className="my-4 flex justify-center">
                              <img 
                                {...props} 
                                className="max-h-64 rounded-lg shadow-md" 
                                style={{ maxWidth: '100%', height: 'auto' }}
                                alt={props.alt || "Explanation image"} 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                }}
                              />
                            </div>
                          ),
                          p: ({ node, ...props }) => {
                            return <p {...props} />;
                          }
                        }}
                      >
                        {currentBlock.explanation || 'No explanation available.'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}; 