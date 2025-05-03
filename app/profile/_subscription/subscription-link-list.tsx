"use client";

import { Subscription } from "@prisma/client";
import { useEffect, useState, useMemo } from "react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grip, Pencil, Trash, CreditCard, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface SubscriptionListProps {
  items: Subscription[]; // Accept array of Subscription type
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void; // Add onDelete prop for delete functionality
}

// Individual sortable item component
const SortableItem = ({ 
  subscription, 
  onEdit, 
  onDelete, 
  confirmDelete 
}: { 
  subscription: Subscription; 
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  confirmDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: subscription.id,
    data: {
      subscription
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-x-2 rounded-lg mb-4 text-sm overflow-hidden backdrop-blur-sm transition-all duration-200 group",
        "bg-white/50 dark:bg-gray-800/60",
        "border border-gray-200/50 dark:border-gray-700/50",
        "hover:border-gray-300 dark:hover:border-gray-600",
        isDragging && "border-blue-500/50 bg-blue-50/10 dark:bg-gray-700/80"
      )}
      ref={setNodeRef}
      style={style}
    >
      <div
        className={cn(
          "px-2 py-3 transition",
          "border-r border-r-gray-200/50 dark:border-r-gray-700/50",
          "hover:bg-gray-100/50 dark:hover:bg-gray-700/50",
          "rounded-l-lg"
        )}
        {...attributes}
        {...listeners}
      >
        <Grip className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 px-4 py-3 flex-grow">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-300 dark:to-cyan-300 bg-clip-text">
            {subscription.name}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Platform: <span className="text-blue-600 dark:text-blue-400">{subscription.platform}</span>
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              <CreditCard className="inline-block h-3 w-3 mr-1" />
              <span className="text-emerald-600 dark:text-emerald-400">{subscription.cardUsed}</span>
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              <DollarSign className="inline-block h-3 w-3 mr-1" />
              <span className="text-green-600 dark:text-green-400">${subscription.amount.toFixed(2)}</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="inline-block h-3 w-3 mr-1" />
              Start: <span className="text-blue-600 dark:text-blue-400">
                {format(new Date(subscription.dateOfSubscription), 'MMM dd, yyyy')}
              </span>
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              <Calendar className="inline-block h-3 w-3 mr-1" />
              End: <span className="text-rose-600 dark:text-rose-400">
                {format(new Date(subscription.endOfSubscription), 'MMM dd, yyyy')}
              </span>
            </span>
          </div>
          <a
            href={subscription.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <span className="truncate">{subscription.url}</span>
          </a>
        </div>
      </div>
      <div className="ml-auto pr-4 flex items-center gap-x-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(subscription.id)}
          className="flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          <span className="text-sm">Edit</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => confirmDelete(subscription.id)}
          className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
        >
          <Trash className="w-4 h-4" />
          <span className="text-sm">Delete</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export const SubscriptionList = ({
  items,
  onReorder,
  onEdit,
  onDelete,
}: SubscriptionListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  useEffect(() => {
    setIsMounted(true);
    setSubscriptions(
      [...items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    );
  }, [items]);

  // Prepare sensors for drag and drop functionality
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ID array for sortable context
  const itemIds = useMemo(() => subscriptions.map((subscription) => subscription.id), [subscriptions]);

  // Find active item for drag overlay
  const activeSubscription = useMemo(() => {
    if (!activeId) return null;
    return subscriptions.find((subscription) => subscription.id === activeId) || null;
  }, [activeId, subscriptions]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Find the indexes for the source and destination
    const oldIndex = subscriptions.findIndex((subscription) => subscription.id === active.id);
    const newIndex = subscriptions.findIndex((subscription) => subscription.id === over.id);

    if (oldIndex === newIndex) return;

    // Create the new array with the updated order
    const newSubscriptions = arrayMove(subscriptions, oldIndex, newIndex);
    
    // Update the position property for each item
    const updatedSubscriptions = newSubscriptions.map((subscription, index) => ({
      ...subscription,
      position: index,
    }));

    // Update local state immediately for responsiveness
    setSubscriptions(updatedSubscriptions);

    // Prepare data for the API call
    const bulkUpdateData = updatedSubscriptions.map((subscription) => ({
      id: subscription.id,
      position: subscription.position,
    }));

    // Send the update to the backend
    onReorder(bulkUpdateData);
  };

  const confirmDelete = (id: string) => {
    setSubscriptionToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (subscriptionToDelete) {
      onDelete(subscriptionToDelete);
      setShowDeleteModal(false);
      setSubscriptionToDelete(null);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div>
            <AnimatePresence>
              {subscriptions.map((subscription) => (
                <SortableItem
                  key={subscription.id}
                  subscription={subscription}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  confirmDelete={confirmDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {/* Drag overlay - shows a preview of the dragged item */}
        <DragOverlay adjustScale={true}>
          {activeSubscription && (
            <div className="opacity-70">
              <SortableItem
                subscription={activeSubscription}
                onEdit={onEdit}
                onDelete={onDelete}
                confirmDelete={confirmDelete}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Delete Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={cn(
              "p-6 rounded-xl shadow-xl max-w-md w-full mx-4",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700"
            )}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this subscription? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
