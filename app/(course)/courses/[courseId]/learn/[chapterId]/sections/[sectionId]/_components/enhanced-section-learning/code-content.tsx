import { useState } from "react";
import { Code, Copy, ExternalLink, Star, Zap, Brain, Grid3X3, List, ChevronDown, ChevronUp, Play, Expand } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion, AnimatePresence } from "framer-motion";

interface CodeContentProps {
  codeExplanations: Array<{
    id: string;
    title: string;
    description?: string | null;
    code?: string | null;
    language?: string | null;
    difficulty?: string | null;
    concepts?: string[];
    author?: string | null;
    explanation?: string | null;
  }>;
}

export const CodeContent = ({ codeExplanations }: CodeContentProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const getDifficultyColor = (difficulty?: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-50 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getDifficultyIcon = (difficulty?: string | null) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return <Star className="w-3 h-3" />;
      case "intermediate":
        return <Zap className="w-3 h-3" />;
      case "advanced":
        return <Brain className="w-3 h-3" />;
      default:
        return <Code className="w-3 h-3" />;
    }
  };

  const getLanguageColor = (language?: string | null) => {
    switch (language?.toLowerCase()) {
      case "javascript":
      case "js":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "typescript":
      case "ts":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "python":
      case "py":
        return "bg-green-50 text-green-700 border-green-200";
      case "java":
        return "bg-red-50 text-red-700 border-red-200";
      case "cpp":
      case "c++":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "html":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "css":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  const copyToClipboard = async (code?: string | null) => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const detectLanguage = (code?: string | null, language?: string | null): string => {
    if (language) return language.toLowerCase();
    if (!code) return 'typescript';
    
    if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
    if (code.includes('import') && code.includes('from')) return 'typescript';
    if (code.includes('<div') || code.includes('</div>')) return 'html';
    if (code.includes('class') && code.includes('{') && !code.includes('function')) return 'css';
    if (code.includes('def ') || code.includes('print(')) return 'python';
    return 'typescript';
  };

  if (codeExplanations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Code className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No Code Examples Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Code explanations will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Code Examples ({codeExplanations.length})
        </h3>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
            <Code className="w-3 h-3 mr-1" />
            Code
          </Badge>
        </div>
      </div>

      {/* Code Examples List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 gap-6" 
          : "space-y-6"
      )}>
        {codeExplanations.map((codeItem, index) => {
          const isExpanded = expandedItems.includes(codeItem.id);
          const detectedLanguage = detectLanguage(codeItem.code, codeItem.language);
          
          return (
            <motion.div
              key={codeItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header with Title and Controls */}
              <div className="flex justify-between items-center bg-gradient-to-r from-slate-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:via-slate-800 dark:to-purple-900/30 p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {codeItem.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {codeItem.language && (
                        <Badge variant="outline" className={`text-xs ${getLanguageColor(codeItem.language)}`}>
                          {codeItem.language.toUpperCase()}
                        </Badge>
                      )}
                      {codeItem.difficulty && (
                        <Badge variant="outline" className={`text-xs ${getDifficultyColor(codeItem.difficulty)}`}>
                          {getDifficultyIcon(codeItem.difficulty)}
                          <span className="ml-1 capitalize">{codeItem.difficulty}</span>
                        </Badge>
                      )}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Example {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => copyToClipboard(codeItem.code)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    onClick={() => toggleExpanded(codeItem.id)}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3"
                  >
                    <Expand className="w-3 h-3 mr-1" />
                    {isExpanded ? 'Collapse' : 'View Code'}
                  </Button>
                </div>
              </div>

              {/* Description */}
              {codeItem.description && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {codeItem.description}
                  </p>
                </div>
              )}

              {/* Expandable Content Area */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="h-96 md:h-[500px]">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:divide-x divide-slate-200 dark:divide-slate-700 h-full">
                        {/* Code Section - Left */}
                        <div className="h-full overflow-hidden bg-slate-950">
                          {/* Code Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-slate-400 text-sm font-mono ml-2">
                                code.{detectedLanguage === 'javascript' ? 'js' : detectedLanguage === 'typescript' ? 'ts' : detectedLanguage === 'python' ? 'py' : 'txt'}
                              </span>
                            </div>
                            <Button
                              onClick={() => copyToClipboard(codeItem.code)}
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-slate-300 h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {/* Code Content */}
                          <div className="h-full overflow-auto">
                            <SyntaxHighlighter
                              language={detectedLanguage}
                              style={vscDarkPlus}
                              customStyle={{
                                margin: 0,
                                padding: '16px',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                height: '100%',
                                minHeight: '100%',
                                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                              }}
                              showLineNumbers
                              lineNumberStyle={{
                                fontSize: '11px',
                                color: '#6b7280'
                              }}
                            >
                              {codeItem.code || '// No code available'}
                            </SyntaxHighlighter>
                          </div>
                        </div>

                        {/* Explanation Section - Right */}
                        <div className="h-full overflow-hidden bg-white dark:bg-slate-900">
                          {/* Explanation Header */}
                          <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              Explanation
                            </h4>
                          </div>
                          
                          {/* Explanation Content */}
                          <div className="h-full overflow-auto p-4">
                            {codeItem.explanation ? (
                              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeRaw]}
                                  components={{
                                    img: ({ node, ...props }) => (
                                      <div className="my-3 flex justify-center">
                                        <img 
                                          {...props} 
                                          className="max-h-40 rounded-lg shadow-sm max-w-full h-auto" 
                                          alt={props.alt || "Code explanation image"} 
                                        />
                                      </div>
                                    ),
                                    p: ({ node, ...props }) => (
                                      <p {...props} className="text-sm leading-relaxed mb-3" />
                                    ),
                                    h1: ({ node, ...props }) => (
                                      <h1 {...props} className="text-lg font-semibold mb-3" />
                                    ),
                                    h2: ({ node, ...props }) => (
                                      <h2 {...props} className="text-base font-semibold mb-2" />
                                    ),
                                    h3: ({ node, ...props }) => (
                                      <h3 {...props} className="text-sm font-medium mb-2" />
                                    ),
                                    code: ({ node, ...props }) => (
                                      <code {...props} className="text-xs bg-purple-100 dark:bg-purple-900/30 px-1.5 py-0.5 rounded font-mono" />
                                    ),
                                    ul: ({ node, ...props }) => (
                                      <ul {...props} className="text-sm space-y-1 ml-4" />
                                    ),
                                    ol: ({ node, ...props }) => (
                                      <ol {...props} className="text-sm space-y-1 ml-4" />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                      <blockquote {...props} className="border-l-4 border-purple-300 dark:border-purple-700 pl-4 italic text-slate-600 dark:text-slate-400" />
                                    ),
                                  }}
                                >
                                  {codeItem.explanation}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                  No explanation available for this code example.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Concepts Footer */}
              {codeItem.concepts && codeItem.concepts.length > 0 && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Key Concepts:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {codeItem.concepts.slice(0, 5).map((concept, conceptIndex) => (
                      <Badge key={conceptIndex} variant="outline" className="text-xs bg-white dark:bg-slate-800">
                        {concept}
                      </Badge>
                    ))}
                    {codeItem.concepts.length > 5 && (
                      <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                        +{codeItem.concepts.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}; 