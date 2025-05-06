"use client";

import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useToastStore } from "@/store/toast-store";

export default function ClientToaster() {
  const [isMounted, setIsMounted] = useState(false);
  const { processQueue } = useToastStore();

  useEffect(() => {
    setIsMounted(true);
    // Process any pending toasts
    processQueue();
  }, [processQueue]);

  if (!isMounted) {
    return null;
  }

  return <Toaster />;
} 