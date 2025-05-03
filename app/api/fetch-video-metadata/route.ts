import { NextResponse } from "next/server";
import axios from "axios";
import { load } from 'cheerio';

// Direct function to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Standard YouTube URL
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];
  
  // Short youtu.be URL
  match = url.match(/youtu\.be\/([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];
  
  // URL with v= parameter
  match = url.match(/[?&]v=([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];
  
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Extract video details based on the platform
    const videoData = await extractVideoMetadata(url);

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video metadata' },
      { status: 500 }
    );
  }
}

async function extractVideoMetadata(url: string) {
  // Base metadata object
  let metadata = {
    title: '',
    description: '',
    thumbnail: '',
    platform: 'unknown',
    embedUrl: '',
    author: '',
    duration: '',
  };

  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);

  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    metadata.platform = 'youtube';
    metadata.embedUrl = `https://www.youtube.com/embed/${videoId}`;
    metadata.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    try {
      // Fetch page content to get title and description
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        },
      });
      
      const $ = load(response.data);
      
      metadata.title = $('meta[property="og:title"]').attr('content') || 
                      $('title').text() || 
                      `YouTube Video (${videoId})`;
      
      metadata.description = $('meta[property="og:description"]').attr('content') || 
                            $('meta[name="description"]').attr('content') || 
                            '';
      
      metadata.author = $('meta[name="author"]').attr('content') || 
                       $('span[itemprop="author"] link[itemprop="name"]').attr('content') || 
                       '';
    } catch (error) {
      console.error('Error fetching YouTube page content:', error);
      metadata.title = `YouTube Video (${videoId})`;
    }
    
    return metadata;
  }

  // Vimeo URL patterns
  const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|)(\d+)(?:|\/\?)/i;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch && vimeoMatch[2]) {
    const videoId = vimeoMatch[2];
    metadata.platform = 'vimeo';
    metadata.embedUrl = `https://player.vimeo.com/video/${videoId}`;
    
    try {
      // Use Vimeo oEmbed API to get metadata
      const oembedResponse = await axios.get(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      const data = oembedResponse.data;
      
      metadata.title = data.title || `Vimeo Video (${videoId})`;
      metadata.description = data.description || '';
      metadata.thumbnail = data.thumbnail_url || '';
      metadata.author = data.author_name || '';
      metadata.duration = data.duration ? `${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}` : '';
    } catch (error) {
      console.error('Error fetching Vimeo oEmbed data:', error);
      metadata.title = `Vimeo Video (${videoId})`;
      
      // Fallback: Try to scrape the page
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
          },
        });
        
        const $ = load(response.data);
        
        metadata.title = metadata.title || $('meta[property="og:title"]').attr('content') || $('title').text();
        metadata.description = metadata.description || $('meta[property="og:description"]').attr('content') || '';
        metadata.thumbnail = metadata.thumbnail || $('meta[property="og:image"]').attr('content') || '';
      } catch (secondError) {
        console.error('Error fetching Vimeo page content:', secondError);
      }
    }
    
    return metadata;
  }

  // Generic video URL - try to scrape metadata
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      },
    });
    
    const $ = load(response.data);
    
    metadata.title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Video';
    metadata.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    metadata.thumbnail = $('meta[property="og:image"]').attr('content') || '';
    metadata.author = $('meta[name="author"]').attr('content') || '';
    metadata.platform = new URL(url).hostname.replace('www.', '');
  } catch (error) {
    console.error('Error fetching generic video page:', error);
    const domain = new URL(url).hostname.replace('www.', '');
    metadata.title = `Video from ${domain}`;
    metadata.platform = domain;
  }
  
  return metadata;
} 