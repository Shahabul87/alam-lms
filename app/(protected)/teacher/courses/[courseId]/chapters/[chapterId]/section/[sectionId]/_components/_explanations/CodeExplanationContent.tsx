"use client";

import { Code2, BookOpen } from "lucide-react";
import { Editor } from '@monaco-editor/react';
import { CodeBlock, ExplanationBlock, ExplanationItem } from "./types";
import { parseCodeBlocks, parseExplanationBlocks } from "./utils";

interface CodeExplanationContentProps {
  item: ExplanationItem;
}

export const CodeExplanationContent = ({ item }: CodeExplanationContentProps) => {
  const codeBlocks = parseCodeBlocks(item.code || '');
  const explanationBlocks = parseExplanationBlocks(item.explanation || '');

  // Log parsing results for each item
  console.log(`🔍 CodeExplanationContent - Parsed data for item ${item.id}:`, {
    itemId: item.id,
    originalCode: item.code,
    originalExplanation: item.explanation,
    codeBlocks: codeBlocks,
    explanationBlocks: explanationBlocks,
    codeBlocksCount: codeBlocks.length,
    explanationBlocksCount: explanationBlocks.length
  });

  return (
    <div className="space-y-8">
      {Math.max(codeBlocks.length, explanationBlocks.length) > 0 ? (
        Array.from({ length: Math.max(codeBlocks.length, explanationBlocks.length) }).map((_, index) => {
          // Log each code/explanation pair
          console.log(`🔍 CodeExplanationContent - Rendering block ${index} for item ${item.id}:`, {
            codeBlock: codeBlocks[index] || null,
            explanationBlock: explanationBlocks[index] || null
          });
          
          return (
            <div key={index} className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
              {/* Code Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <Code2 className="h-5 w-5 mr-3" />
                    Code Block {index + 1}
                  </h3>
                </div>
                <div className="relative bg-gray-900">
                  {codeBlocks[index] ? (
                    <Editor
                      height={`${Math.min(Math.max(codeBlocks[index].code.split('\n').length * 19 + 40, 200), 500)}px`}
                      language={codeBlocks[index].language}
                      value={codeBlocks[index].code}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        lineNumbers: 'on',
                        renderLineHighlight: 'none',
                        selectOnLineNumbers: true,
                        scrollbar: {
                          vertical: 'hidden',
                          horizontal: 'hidden'
                        },
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        overviewRulerBorder: false,
                        padding: { top: 10, bottom: 10 },
                      }}
                    />
                  ) : (
                    <div className="p-6 h-[200px] bg-gray-900 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No code block available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Explanation Section */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-3">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                    </svg>
                    Explanation {index + 1}
                  </h3>
                </div>
                <div className="p-6 min-h-[200px] max-h-[500px] overflow-y-auto scrollbar-hide">
                  {explanationBlocks[index] ? (
                    <div 
                      className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
                      dangerouslySetInnerHTML={{ __html: explanationBlocks[index].explanation }}
                    />
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 italic text-center h-full flex items-center justify-center">
                      <div>
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No explanation available for this block</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Code2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">No content available</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-100 text-xs rounded max-w-md mx-auto">
              <div>🔍 <strong>No Content Debug:</strong></div>
              <div>Code blocks: {codeBlocks.length}</div>
              <div>Explanation blocks: {explanationBlocks.length}</div>
              <div>Original code: "{item.code}"</div>
              <div>Original explanation: "{item.explanation}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 