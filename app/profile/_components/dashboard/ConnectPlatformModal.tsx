"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Loader2,
  ExternalLink
} from "lucide-react";

// Platform icons - you might want to use actual platform icons or a library like react-icons
const PlatformIcons = {
  twitter: "𝕏",
  instagram: "📷",
  linkedin: "💼",
  youtube: "▶️",
  tiktok: "🎵",
  facebook: "👥",
  pinterest: "📌",
  snapchat: "👻",
  reddit: "🔴",
  discord: "🎮",
  twitch: "🎮",
  github: "🐙",
  medium: "📝",
  behance: "🎨",
  dribbble: "🏀"
};

interface Platform {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'social' | 'professional' | 'creative' | 'gaming' | 'content';
  color: string;
  isPopular?: boolean;
  isComingSoon?: boolean;
}

const platforms: Platform[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: PlatformIcons.twitter,
    description: 'Connect your Twitter account to track tweets and engagement',
    category: 'social',
    color: 'from-blue-600 to-blue-700',
    isPopular: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: PlatformIcons.instagram,
    description: 'Sync your Instagram posts, stories, and follower metrics',
    category: 'social',
    color: 'from-pink-600 to-purple-600',
    isPopular: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: PlatformIcons.linkedin,
    description: 'Track your professional network and post performance',
    category: 'professional',
    color: 'from-blue-700 to-blue-800',
    isPopular: true
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: PlatformIcons.youtube,
    description: 'Monitor your channel analytics and video performance',
    category: 'content',
    color: 'from-red-600 to-red-700',
    isPopular: true
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: PlatformIcons.tiktok,
    description: 'Analyze your TikTok videos and follower growth',
    category: 'social',
    color: 'from-pink-500 to-cyan-500',
    isPopular: true
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: PlatformIcons.facebook,
    description: 'Connect your Facebook page and personal profile',
    category: 'social',
    color: 'from-blue-600 to-blue-700'
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: PlatformIcons.pinterest,
    description: 'Track your pins and board performance',
    category: 'creative',
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: PlatformIcons.snapchat,
    description: 'Monitor your Snapchat story views and friends',
    category: 'social',
    color: 'from-yellow-400 to-yellow-500'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: PlatformIcons.reddit,
    description: 'Track your Reddit posts and community engagement',
    category: 'social',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: PlatformIcons.discord,
    description: 'Connect your Discord server analytics',
    category: 'gaming',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: PlatformIcons.twitch,
    description: 'Monitor your streaming metrics and follower count',
    category: 'gaming',
    color: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: PlatformIcons.github,
    description: 'Track your repositories and contribution activity',
    category: 'professional',
    color: 'from-gray-700 to-gray-800'
  },
  {
    id: 'medium',
    name: 'Medium',
    icon: PlatformIcons.medium,
    description: 'Analyze your Medium articles and reader engagement',
    category: 'content',
    color: 'from-green-600 to-green-700'
  },
  {
    id: 'behance',
    name: 'Behance',
    icon: PlatformIcons.behance,
    description: 'Showcase your creative portfolio metrics',
    category: 'creative',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    icon: PlatformIcons.dribbble,
    description: 'Track your design work engagement and followers',
    category: 'creative',
    color: 'from-pink-500 to-rose-500'
  }
];

interface ConnectPlatformModalProps {
  children: React.ReactNode;
}

export function ConnectPlatformModal({ children }: ConnectPlatformModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Platforms', count: platforms.length },
    { id: 'social', name: 'Social Media', count: platforms.filter(p => p.category === 'social').length },
    { id: 'professional', name: 'Professional', count: platforms.filter(p => p.category === 'professional').length },
    { id: 'content', name: 'Content', count: platforms.filter(p => p.category === 'content').length },
    { id: 'creative', name: 'Creative', count: platforms.filter(p => p.category === 'creative').length },
    { id: 'gaming', name: 'Gaming', count: platforms.filter(p => p.category === 'gaming').length }
  ];

  const filteredPlatforms = selectedCategory === 'all' 
    ? platforms 
    : platforms.filter(platform => platform.category === selectedCategory);

  const handleConnectPlatform = async (platform: Platform) => {
    if (platform.isComingSoon) return;
    
    setConnectingPlatform(platform.id);
    
    try {
      // Redirect to OAuth flow
      window.location.href = `/api/auth/${platform.id}/connect`;
    } catch (error) {
      console.error('Error connecting platform:', error);
      setConnectingPlatform(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Connect Your Platforms
          </DialogTitle>
          <p className="text-slate-400">
            Connect your social media and professional platforms to get comprehensive analytics and insights.
          </p>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 py-4 border-b border-slate-700">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`${
                selectedCategory === category.id
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {category.name}
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {filteredPlatforms.map((platform) => (
            <div
              key={platform.id}
              className={`relative p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors ${
                platform.isComingSoon ? 'opacity-50' : 'hover:bg-slate-800/50'
              }`}
            >
              {platform.isPopular && (
                <Badge 
                  className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs"
                >
                  Popular
                </Badge>
              )}
              
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xl`}>
                  {platform.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium">{platform.name}</h3>
                  <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                    {platform.description}
                  </p>
                  
                  <Button
                    onClick={() => handleConnectPlatform(platform)}
                    disabled={connectingPlatform === platform.id || platform.isComingSoon}
                    className={`mt-3 w-full ${
                      platform.isComingSoon
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                        : `bg-gradient-to-r ${platform.color} hover:opacity-90 text-white`
                    }`}
                    size="sm"
                  >
                    {connectingPlatform === platform.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : platform.isComingSoon ? (
                      "Coming Soon"
                    ) : (
                      <>
                        Connect
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-500 text-sm text-center">
            Don't see your platform? <Button variant="link" className="text-blue-400 p-0 h-auto">Request it here</Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 