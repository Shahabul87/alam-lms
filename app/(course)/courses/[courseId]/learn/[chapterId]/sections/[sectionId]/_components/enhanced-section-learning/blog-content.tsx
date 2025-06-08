import { useState } from "react";
import { BookOpen, Clock, Calendar, User, ExternalLink, Grid3X3, List } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogContentProps {
  blogs: Array<{
    id: string;
    title: string;
    content?: string | null;
    excerpt?: string | null;
    author?: string | null;
    publishedAt?: Date | null;
    readTime?: number | null;
    tags?: string[];
    featured?: boolean;
  }>;
}

export const BlogContent = ({ blogs }: BlogContentProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const formatDate = (date?: Date | null) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatReadTime = (minutes?: number | null) => {
    if (!minutes) return "5 min read";
    return `${minutes} min read`;
  };

  const getExcerpt = (content?: string | null, excerpt?: string | null) => {
    if (excerpt) return excerpt;
    if (content) {
      // Extract first 150 characters and add ellipsis
      const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      return text.length > 150 ? text.substring(0, 150) + '...' : text;
    }
    return "No preview available for this blog post.";
  };

  const handleBlogClick = (blog: any) => {
    // You can implement blog URL logic here - for now opening a placeholder
    const blogUrl = blog.url || `#blog-${blog.id}`;
    window.open(blogUrl, '_blank', 'noopener,noreferrer');
  };

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          No Blog Posts Available
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Blog content will appear here when available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Blog Articles ({blogs.length})
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
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            <BookOpen className="w-3 h-3 mr-1" />
            Blogs
          </Badge>
        </div>
      </div>

      {/* Blog Grid/List */}
      <div className={cn(
        viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "grid gap-6"
      )}>
        {blogs.map((blog, index) => (
          <Card 
            key={blog.id} 
            className={`group hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-700 cursor-pointer ${blog.featured ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}
            onClick={() => handleBlogClick(blog)}
          >
            {blog.featured && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg">
                Featured Article
              </div>
            )}

            {viewMode === "grid" ? (
              /* Grid View */
              <div className="relative">
                {/* External Link Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow-sm">
                    <ExternalLink className="w-3 h-3 text-slate-700 dark:text-slate-300" />
                  </div>
                </div>

                {/* Blog Header */}
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {blog.title}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                      #{index + 1}
                    </span>
                  </div>
                  
                  {/* Blog Metadata */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {blog.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{blog.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatReadTime(blog.readTime)}</span>
                    </div>
                  </div>

                  {/* Blog Excerpt */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {getExcerpt(blog.content, blog.excerpt)}
                  </p>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 2).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                          +{blog.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Publication Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(blog.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mb-2 flex items-center gap-2">
                        {blog.title}
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      
                      {/* Blog Metadata */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                        {blog.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{blog.author}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(blog.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatReadTime(blog.readTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                      Article {index + 1}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Blog Excerpt */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {getExcerpt(blog.content, blog.excerpt)}
                  </p>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                          {tag}
                        </Badge>
                      ))}
                      {blog.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800">
                          +{blog.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Read More Button */}
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 p-0"
                    >
                      Read full article
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Available</span>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}; 