import { NextResponse } from "next/server";
import axios from "axios";
import { load } from "cheerio";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      },
    });

    const html = response.data;
    const $ = load(html);

    // Get metadata
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || 
                 $('title').text() || '';

    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') || 
                        $('meta[name="description"]').attr('content') || '';

    const siteName = $('meta[property="og:site_name"]').attr('content') || 
                     new URL(url).hostname.replace('www.', '');

    let author = $('meta[property="article:author"]').attr('content') || 
                $('meta[name="author"]').attr('content') || '';
                
    // If author is a URL, try to extract the name
    if (author && author.startsWith('http')) {
      author = author.split('/').filter(Boolean).pop() || author;
    }

    // Extract favicon
    const favicon = $('link[rel="icon"]').attr('href') || 
                   $('link[rel="shortcut icon"]').attr('href') || 
                   `https://${new URL(url).hostname}/favicon.ico`;

    // Resolve relative favicon URLs to absolute
    const faviconUrl = favicon.startsWith('http') 
      ? favicon 
      : new URL(favicon, url).href;

    // Get image URL (thumbnail)
    let thumbnail = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') || '';

    // Resolve relative image URLs to absolute
    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = new URL(thumbnail, url).href;
    }

    return NextResponse.json({
      title,
      description,
      siteName,
      author,
      favicon: faviconUrl,
      thumbnail,
      url
    });
  } catch (error) {
    console.error('Error fetching blog metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog metadata' },
      { status: 500 }
    );
  }
} 