import { useState, useCallback, useEffect } from 'react';
import { SearchResult } from '../types/header-types';
import axios from 'axios';

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
}

// Fallback results to use if the API fails
const fallbackResults: SearchResult[] = [
  {
    id: 'fallback-1',
    title: 'JavaScript Fundamentals',
    type: 'course',
    snippet: 'Learn the basics of JavaScript programming language.',
    thumbnail: 'https://utfs.io/f/fallback-image.jpg'
  },
  {
    id: 'fallback-2',
    title: 'React Best Practices',
    type: 'blog',
    snippet: 'Tips and tricks for writing better React applications.',
    thumbnail: 'https://utfs.io/f/fallback-blog-image.jpg'
  }
];

export function useSearch(): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const performSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    console.log("🔍 Performing search for:", searchQuery);
    
    try {
      console.log("👉 Calling search API");
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("📊 Search results:", data);
      
      if (data && Array.isArray(data.results)) {
        console.log(`✅ Found ${data.results.length} results`);
        setSearchResults(data.results);
      } else {
        console.error("❌ Results format is invalid:", data);
        setSearchError("Invalid response format");
        setSearchResults(fallbackResults);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults(fallbackResults);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Debounced search with error handling
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        console.log("⏱️ Debounced search triggered for:", searchQuery);
        performSearch().catch(error => {
          console.error("❌ Unhandled search error:", error);
          setSearchError("An unexpected error occurred");
          setIsSearching(false);
        });
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 400); // Increased from 300ms to give more time for typing

    // Special handling for "transformer" query - search immediately
    if (searchQuery.toLowerCase().includes("transform")) {
      console.log("⚡ Immediate search triggered for transformer query");
      clearTimeout(debounceTimer);
      performSearch().catch(error => {
        console.error("❌ Unhandled search error:", error);
        setSearchError("An unexpected error occurred");
        setIsSearching(false);
      });
    }

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    performSearch,
    clearSearch
  };
} 