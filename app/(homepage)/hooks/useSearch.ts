import { useState, useCallback, useEffect } from 'react';
import { SearchResult } from '../types/header-types';
import { DatabaseSearchService } from '../services/db-search-service';

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
  performSearch: () => Promise<void>;
  clearSearch: () => void;
}

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
      console.log("👉 Calling DatabaseSearchService.searchContent");
      const results = await DatabaseSearchService.searchContent(searchQuery);
      console.log("📊 Search results:", results);
      
      if (Array.isArray(results)) {
        console.log(`✅ Found ${results.length} results`);
        setSearchResults(results);
      } else {
        console.error("❌ Results is not an array:", results);
        setSearchError("Invalid response format");
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
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