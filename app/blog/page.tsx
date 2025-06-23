"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Grid, List, TrendingUp, Calendar, User, Eye, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import MyPostCard from "./blog-card";

// Updated interface to match actual data structure
interface Post {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  category: string | null;
  createdAt: string; // ISO string from server
  updatedAt: Date;
  userId: string;
  comments: Array<{ id: string }>; // Array of comment objects with id
  user?: {
    name: string | null;
  };
  views?: number;
}

// Transform post for card component
interface CardPost {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  published: boolean;
  category: string | null;
  createdAt: string;
  comments: {
    length: number;
  };
}

const BlogPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"newest" | "popular" | "trending">("newest");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch posts from API route
  const fetchPosts = useCallback(async (forceRefresh = false) => {
    try {
      console.log("🔄 BlogPage: Starting API fetch...", { forceRefresh });
      setLoading(true);
      setError(null);
      
      // Add cache busting for force refresh
      const url = forceRefresh ? `/api/posts?t=${Date.now()}` : '/api/posts';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Disable caching for navigation issues
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log("📦 BlogPage: Received API response:", {
        success: data.success,
        count: data.count,
        hasError: !!data.error,
        samplePosts: data.posts?.slice(0, 2)
      });
      
      if (!data.success) {
        throw new Error(data.message || data.error || "Failed to fetch posts");
      }
      
      if (!Array.isArray(data.posts)) {
        throw new Error("Invalid data format received from API");
      }

      // Validate and filter posts
      const validPosts = data.posts.filter((post: any): post is Post => {
        const isValid = post && 
          typeof post === 'object' && 
          typeof post.id === 'string' && 
          typeof post.title === 'string' &&
          post.id.length > 0 &&
          post.title.length > 0;
        
        if (!isValid) {
          console.warn("❌ BlogPage: Invalid post filtered out:", post);
        }
        
        return isValid;
      });

      console.log(`✅ BlogPage: ${validPosts.length} valid posts processed`);
      
      // Ensure both states are set properly
      console.log("📋 BlogPage: Setting posts and filteredPosts to:", validPosts.length);
      setPosts(validPosts);
      
      // Immediately set filteredPosts to avoid empty state
      setFilteredPosts(validPosts);
      
    } catch (err) {
      console.error("💥 BlogPage: Error fetching posts:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load posts";
      setError(errorMessage);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle page visibility change to refetch data when returning to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && posts.length === 0) {
        console.log("🔄 BlogPage: Page became visible, refetching posts...");
        fetchPosts(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [posts.length, fetchPosts]);

  // Fetch posts on component mount and when refresh key changes
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshKey]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 BlogPage: Component unmounting, cleaning up...");
    };
  }, []);

  // Filter and sort posts
  useEffect(() => {
    console.log("🎯 BlogPage: Filter effect triggered", {
      postsLength: posts.length,
      searchQuery,
      selectedCategory,
      sortBy,
      currentFilteredLength: filteredPosts.length
    });

    try {
      // Early return if no posts
      if (posts.length === 0) {
        console.log("❌ BlogPage: No posts to filter");
        setFilteredPosts([]);
        return;
      }

      let filtered = [...posts];
      console.log("📊 BlogPage: Starting with posts:", filtered.length);

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(post =>
          post.title.toLowerCase().includes(query) ||
          (post.description && post.description.toLowerCase().includes(query))
        );
        console.log(`🔍 BlogPage: After search filter "${searchQuery}":`, filtered.length);
      }

      // Category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter(post => post.category === selectedCategory);
        console.log(`📂 BlogPage: After category filter "${selectedCategory}":`, filtered.length);
      }

      // Sort posts
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "popular":
            return (b.comments?.length || 0) - (a.comments?.length || 0);
          case "trending":
            return (b.views || 0) - (a.views || 0);
          default:
            return 0;
        }
      });

      console.log(`✅ BlogPage: Setting filtered posts:`, filtered.length);
      setFilteredPosts(filtered);
    } catch (err) {
      console.error("BlogPage: Error filtering posts:", err);
      setFilteredPosts([]);
    }
  }, [posts, searchQuery, selectedCategory, sortBy]);

  // Get unique categories with stable keys
  const categories = useMemo(() => {
    try {
      const categorySet = new Set<string>();
      categorySet.add("all");
      
      posts.forEach(post => {
        if (post.category && post.category.trim()) {
          categorySet.add(post.category.trim());
        }
      });
      
      return Array.from(categorySet);
    } catch (err) {
      console.error("BlogPage: Error getting categories:", err);
      return ["all"];
    }
  }, [posts]);

  // Transform posts for card component
  const transformPostForCard = (post: Post): CardPost => ({
    id: post.id,
    title: post.title,
    description: post.description,
    imageUrl: post.imageUrl,
    published: post.published,
    category: post.category,
    createdAt: post.createdAt,
    comments: {
      length: post.comments?.length || 0
    }
  });

  // Force refresh function
  const handleForceRefresh = () => {
    console.log("🔄 BlogPage: Force refreshing posts...");
    setRefreshKey(prev => prev + 1);
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md mx-4"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Failed to Load Posts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <div className="space-x-2">
            <button
                onClick={() => fetchPosts(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
              <button
                onClick={handleForceRefresh}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Force Refresh
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 dark:from-purple-800 dark:via-blue-800 dark:to-cyan-700"
      >
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent"
          >
            Discover Stories
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto"
          >
            Explore our collection of insightful articles, tutorials, and stories that inspire and educate
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{posts.length} Articles</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Updated Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Trending Topics</span>
            </div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"
          />
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {categories.map((category, index) => (
                  <option key={`category-${index}-${category}`} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "popular" | "trending")}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Comments</option>
                <option value="trending">Most Views</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleForceRefresh}
                disabled={loading}
                className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                title="Refresh posts"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-purple-600"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-purple-600"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 text-center text-gray-600 dark:text-gray-400"
        >
          {searchQuery || selectedCategory !== "all" ? (
            <p>
              Found {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedCategory !== "all" && ` in ${selectedCategory}`}
            </p>
          ) : (
            <p>Showing all {posts.length} articles</p>
          )}
        </motion.div>

        {/* Posts Grid/List */}
        <div className="mt-8">


          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "No articles have been published yet"}
              </p>
              <div className="space-x-2">
              {(searchQuery || selectedCategory !== "all") && (
                <button
                    onClick={resetFilters}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
                <button
                  onClick={handleForceRefresh}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Refresh Posts
                </button>
              </div>
            </motion.div>
          ) : (
            <div
              key={`posts-${refreshKey}`}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-6"
              }
            >
              {filteredPosts.map((post, index) => {
                const transformedPost = transformPostForCard(post);
                console.log(`🎯 Rendering card ${index}:`, {
                  originalPost: post,
                  transformedPost: transformedPost
                });
                
                return (
                  <div
                    key={`post-${post.id}-${refreshKey}`}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    <MyPostCard 
                      post={transformedPost}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

