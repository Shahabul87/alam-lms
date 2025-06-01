"use client";

import { useState } from "react";
import { toast } from "sonner";
import { injectCustomStyles, parseExplanationBlocks } from "./_explanations/utils";
import { ExplanationsListProps } from "./_explanations/types";
import { EmptyState } from "./_explanations/EmptyState";
import { ExplanationCard } from "./_explanations/ExplanationCard";
import { MathExplanationContent } from "./_explanations/MathExplanationContent";

export const ExplanationsList = ({
  items,
  onCreateClick,
  onEdit,
  onDelete
}: Omit<ExplanationsListProps, 'type'>) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

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
      toast.success("Math explanation deleted successfully");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter only math explanations
  const mathItems = items.filter(item => item.type === "math");

  // Inject custom styles
  injectCustomStyles();

  if (mathItems.length === 0) {
    return <EmptyState type="math" onCreateClick={onCreateClick} />;
  }

  return (
    <div className="space-y-8">
      {mathItems.map((item) => {
        const explanationBlocks = parseExplanationBlocks(item.explanation || '');
        
        return (
          <ExplanationCard
            key={item.id}
            id={item.id}
            heading={item.heading}
            type="math"
            isExpanded={expandedItems[item.id] || false}
            onToggleExpand={() => toggleExpand(item.id)}
            onEdit={() => onEdit(item.id)}
            onDelete={() => handleDelete(item.id)}
            isDeleting={isDeleting}
            subtitle="Math Explanation"
          >
            <MathExplanationContent item={item} />
          </ExplanationCard>
        );
      })}
    </div>
  );
}; 