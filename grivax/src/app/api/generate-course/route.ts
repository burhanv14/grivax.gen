// pages/api/generate-course.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

// Type definitions
interface CourseRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pace: string;
  userId: string;
}

interface LearningResource {
  type: 'video' | 'article' | 'textbook' | 'documentation' | 'exercise' | 'quiz';
  title: string;
  url: string;
  source: 'youtube' | 'coursera' | 'github' | 'wikipedia' | 'medium' | 'official-docs';
  description?: string;
  duration?: string;
  rating?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
}

interface CourseModule {
  week: number;
  title: string;
  objectives: string[];
  resources: LearningResource[];
}

interface CourseResponse {
  topic: string;
  difficulty: string;
  pace: string;
  modules: CourseModule[];
  generatedAt: string;
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
  };
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      default: { url: string };
    };
  };
}

// Environment variables
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const WIKIMEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';

// Helper functions
async function fetchWikipediaSummary(topic: string): Promise<string> {
  try {
    const response = await axios.get(`${WIKIMEDIA_API}/${encodeURIComponent(topic)}`);
    return response.data.extract || 'No Wikipedia summary available';
  } catch (error) {
    console.error('Wikipedia API Error:', error);
    return 'Wikipedia content unavailable';
  }
}

async function fetchYouTubeVideos(topic: string, difficulty: string): Promise<LearningResource[]> {
  try {
    // Search for tutorial videos with better query parameters
    const tutorialResponse = await axios.get<{ items: YouTubeSearchItem[] }>(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          part: 'snippet',
          q: `${topic} tutorial ${difficulty} course`,
          type: 'video',
          videoDuration: 'medium',
          maxResults: 5,
          key: YOUTUBE_API_KEY,
          relevanceLanguage: 'en',
          order: 'relevance'
        }
      }
    );

    if (!tutorialResponse.data.items || tutorialResponse.data.items.length === 0) {
      console.log('No YouTube videos found for:', topic);
      return [];
    }

    // Get video details including duration and statistics
    const videoIds = tutorialResponse.data.items
      .map((item: YouTubeSearchItem) => item.id?.videoId)
      .filter((id: string | undefined): id is string => !!id)
      .join(',');

    if (!videoIds) {
      console.log('No valid video IDs found');
      return [];
    }

    const detailsResponse = await axios.get<{ items: YouTubeVideoDetails[] }>(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'contentDetails,statistics',
          id: videoIds,
          key: YOUTUBE_API_KEY
        }
      }
    );

    // Create a map of video details for easier lookup
    const videoDetailsMap = new Map(
      detailsResponse.data.items.map((item: YouTubeVideoDetails) => [item.id, item])
    );

    // Combine search results with video details
    const resources = tutorialResponse.data.items
      .map((item: YouTubeSearchItem): LearningResource | null => {
        const videoId = item.id?.videoId;
        if (!videoId) return null;

        const details = videoDetailsMap.get(videoId);
        if (!details) return null;

        // Format duration from ISO 8601 to human readable format
        const duration = formatDuration(details.contentDetails.duration);
        
        // Calculate rating (likes/views) with fallback
        const viewCount = parseInt(details.statistics.viewCount) || 0;
        const likeCount = parseInt(details.statistics.likeCount) || 0;
        const rating = viewCount > 0 ? likeCount / viewCount : 0;

        return {
          type: 'video' as const,
          title: item.snippet.title,
          url: `https://www.youtube.com/embed/${videoId}`, // Use embed URL for better compatibility
          source: 'youtube' as const,
          description: item.snippet.description,
          duration: duration,
          rating: rating,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
        };
      })
      .filter((resource): resource is LearningResource => resource !== null);

    return resources;
  } catch (error) {
    console.error('YouTube API Error:', error);
    return [];
  }
}

// Helper function to format YouTube duration
function formatDuration(duration: string): string {
  try {
    // Remove 'PT' prefix and split into components
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;

    const hours = match[1] ? parseInt(match[1].replace('H', '')) : 0;
    const minutes = match[2] ? parseInt(match[2].replace('M', '')) : 0;
    const seconds = match[3] ? parseInt(match[3].replace('S', '')) : 0;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || duration;
  } catch (error) {
    console.error('Duration formatting error:', error);
    return duration;
  }
}

async function fetchGithubResources(topic: string): Promise<LearningResource[]> {
  try {
    const response = await axios.get(
      'https://api.github.com/search/repositories',
      {
        params: {
          q: `${topic} tutorial learning`,
          sort: 'stars',
          order: 'desc',
          per_page: 5
        }
      }
    );

    return response.data.items.map((repo: any) => ({
      type: 'documentation',
      title: repo.name,
      url: repo.html_url,
      source: 'github',
      description: repo.description,
      rating: repo.stargazers_count
    }));
  } catch (error) {
    console.error('GitHub API Error:', error);
    return [];
  }
}

async function generateCourseWithAI(
  topic: string,
  difficulty: string,
  pace: string,
  content: {
    wikipedia: string;
    youtube: LearningResource[];
    github: LearningResource[];
  }
): Promise<CourseResponse> {
  try {
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const prompt = `You are an expert course designer. Create a comprehensive ${difficulty} level course about ${topic} designed for ${pace} pace.

Context:
${content.wikipedia}

Available Resources:
1. Video Tutorials:
${content.youtube.map((v, i) => `${i + 1}. ${v.title} (${v.duration})`).join('\n')}

2. GitHub Resources:
${content.github.map((g, i) => `${i + 1}. ${g.title} - ${g.description}`).join('\n')}

Course Design Guidelines:
1. Structure:
   - Start with fundamental concepts and gradually progress to advanced topics
   - Each module should build upon previous knowledge
   - Include a mix of theory and practical application
   - End with a project that demonstrates mastery

2. Learning Objectives:
   - Each module should have 3-5 clear, measurable objectives
   - Objectives should follow Bloom's Taxonomy (Remember → Understand → Apply → Analyze → Evaluate → Create)
   - Include both theoretical understanding and practical skills

3. Resource Integration:
   - Use provided videos as primary learning materials
   - Supplement with GitHub resources for hands-on practice
   - Include Wikipedia content for theoretical background
   - Add exercises and quizzes between modules
   - End each module with a practical exercise

4. Assessment:
   - Include self-assessment quizzes
   - Add coding exercises where applicable
   - End with a comprehensive project

Generate a JSON response with the following structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "pace": "${pace}",
  "modules": [{
    "week": number,
    "title": string,
    "objectives": string[],
    "resources": [{
      "type": "video" | "article" | "textbook" | "documentation" | "exercise" | "quiz",
      "title": string,
      "url": string,
      "source": "youtube" | "coursera" | "github" | "wikipedia" | "medium" | "official-docs",
      "description": string,
      "duration": string,
      "rating": number,
      "difficulty": "beginner" | "intermediate" | "advanced"
    }]
  }]
}

Important:
1. Use the exact video titles and URLs from the provided resources
2. Ensure each module has a logical flow and clear progression
3. Include practical exercises and projects
4. Make sure objectives are specific and measurable
5. Balance theory with hands-on practice
6. Consider the pace setting when structuring content
7. Respond with ONLY the JSON object, no additional text`;

    console.log('Sending request to Hugging Face API...');
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false,
          response_format: { type: "json_object" }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data || !response.data[0]?.generated_text) {
      throw new Error('Invalid response from Hugging Face API');
    }

    console.log('Received response from Hugging Face API');
    
    // Extract JSON from the response
    const jsonMatch = response.data[0].generated_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const courseData: CourseResponse = JSON.parse(jsonMatch[0]);

    // Validate and clean the course data
    const cleanedCourse: CourseResponse = {
      ...courseData,
      generatedAt: new Date().toISOString(),
      modules: courseData.modules.map((module: CourseModule) => ({
        ...module,
        resources: module.resources.map((resource: LearningResource) => ({
          ...resource,
          // Ensure URLs are valid
          url: resource.url.startsWith('http') ? resource.url : `https://${resource.url}`,
          // Ensure type and source are valid
          type: ['video', 'article', 'textbook', 'documentation', 'exercise', 'quiz'].includes(resource.type) 
            ? resource.type 
            : 'article',
          source: (['youtube', 'coursera', 'github', 'wikipedia', 'medium', 'official-docs'].includes(resource.source)
            ? resource.source
            : 'article') as LearningResource['source']
        }))
      }))
    };

    return cleanedCourse;
  } catch (error) {
    console.error('AI Generation Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(`AI API Error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, difficulty, pace, userId } = body as CourseRequest;

    if (!topic || !difficulty || !pace || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!HUGGINGFACE_API_KEY) {
      console.error('Missing HUGGINGFACE_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    if (!YOUTUBE_API_KEY) {
      console.error('Missing YOUTUBE_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Server configuration error: Missing YouTube API key' },
        { status: 500 }
      );
    }

    console.log('Starting course generation for:', { topic, difficulty, pace });

    // Fetch all resources in parallel with error handling
    let wikipediaSummary = '';
    let youtubeVideos: LearningResource[] = [];
    let githubResources: LearningResource[] = [];

    try {
      const [wiki, youtube, github] = await Promise.all([
        fetchWikipediaSummary(topic),
        fetchYouTubeVideos(topic, difficulty),
        fetchGithubResources(topic)
      ]);

      wikipediaSummary = wiki;
      youtubeVideos = youtube;
      githubResources = github;

      console.log('Resources fetched successfully:', {
        wikiLength: wikipediaSummary.length,
        youtubeCount: youtubeVideos.length,
        githubCount: githubResources.length
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      // Continue with partial data if some resources fail
    }

    // Validate minimum required resources
    if (youtubeVideos.length === 0 && githubResources.length === 0) {
      return NextResponse.json(
        { error: 'No learning resources found for the given topic' },
        { status: 404 }
      );
    }

    try {
      const course = await generateCourseWithAI(topic, difficulty, pace, {
        wikipedia: wikipediaSummary,
        youtube: youtubeVideos,
        github: githubResources
      });

      console.log('Course generated successfully:', {
        topic: course.topic,
        moduleCount: course.modules.length
      });

      return NextResponse.json(course);
    } catch (error) {
      console.error('Error generating course:', error);
      return NextResponse.json(
        { 
          error: 'Failed to generate course structure',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}