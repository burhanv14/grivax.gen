import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Anthropic } from '@anthropic-ai/sdk'
import axios from 'axios'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    // Verify that the genCourse exists with the given id, user_id, and course_id
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    
    if (!genCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    console.log('Course found:', genCourse)
    return NextResponse.json({
      message: 'Course found',
      id: genCourse.id,
      course_id: genCourse.course_id,
      user_id: genCourse.user_id
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course data' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    const data = await request.json()
    
    // Log the acknowledgment
    console.log('Acknowledgment received:', {
      id: params.id,
      user_id: params.user_id,
      course_id: params.course_id,
      message: data.message || 'No message provided'
    })
    
    // Verify that the genCourse exists with the given id, user_id, and course_id
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    
    if (!genCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    // Generate detailed course content using Anthropic
    let detailedCourseContent;
    try {
      detailedCourseContent = await generateDetailedCourse(genCourse)
    } catch (error) {
      console.error('Error generating detailed course content:', error)
      // Create a fallback structure if generation fails
      detailedCourseContent = {
        units: (genCourse.modules as any[]).map((module, index) => ({
          unitNumber: index + 1,
          title: module.title,
          description: `Unit ${index + 1}: ${module.title}`,
          chapters: [
            {
              chapterNumber: 1,
              title: `Introduction to ${module.title}`,
              description: `Introduction to ${module.title}`,
              estimatedTime: "30 minutes",
              learningPoints: Array.isArray(module.objectives) ? module.objectives : ["Learning point 1", "Learning point 2"],
              resources: ["Resource 1", "Resource 2"],
              youtubeSearchQuery: `${module.title} tutorial`
            }
          ]
        }))
      }
    }
    
    // Get course image from Unsplash
    let courseImage;
    try {
      courseImage = await getCourseImage(genCourse.title, genCourse.description)
    } catch (error) {
      console.error('Error getting course image:', error)
      // Use a default image if Unsplash API fails
      courseImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
    }
    
    // Store everything in constants
    const COURSE_DETAILS = {
      id: genCourse.id,
      course_id: genCourse.course_id,
      user_id: genCourse.user_id,
      title: genCourse.title,
      description: genCourse.description,
      image: courseImage,
      detailedContent: detailedCourseContent
    }
    
    // Check if the course exists in the Course table, if not create it
    let course;
    try {
      course = await prisma.course.findUnique({
        where: {
          course_id: genCourse.course_id,
          user_id: genCourse.user_id,
        }
      });
      
      if (!course) {
        console.log(`Course with ID ${genCourse.course_id} not found, creating it...`);
        course = await prisma.course.create({
          data: {
            course_id: genCourse.course_id,
            user_id: genCourse.user_id,
            genId: genCourse.id,
            title: genCourse.title,
            image: courseImage
          }
        });
        console.log(`Created course with ID: ${course.course_id}`);
      } else {
        console.log(`Found existing course with ID: ${course.course_id}`);
      }
    } catch (courseError) {
      console.error('Error checking/creating course:', courseError);
      return NextResponse.json(
        { error: 'Failed to check/create course' },
        { status: 500 }
      );
    }
    
    // Create all units for the course
    const createdUnits = [];
    for (const unit of detailedCourseContent.units) {
      try {
        const unitDetails = {
          unitNumber: unit.unitNumber,
          title: unit.title,
          description: unit.description,
          chapters: unit.chapters
        };
        
        console.log(`Creating unit ${unit.unitNumber}: ${unit.title}`);
        const createdUnit = await createUnit(course.course_id, unitDetails);
        createdUnits.push(createdUnit);
        console.log(`Created unit with ID: ${createdUnit.unit_id}`);
      } catch (unitError) {
        console.error(`Error creating unit ${unit.unitNumber}:`, unitError);
        // Continue with other units even if one fails
      }
    }
    
    // Send acknowledgment to the status endpoint
    try {
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-course/${params.user_id}/${params.course_id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Course generation completed',
          course_id: params.course_id,
          user_id: params.user_id
        }),
      });
      
      if (!statusResponse.ok) {
        console.error('Failed to send acknowledgment to status endpoint:', await statusResponse.text());
      } else {
        console.log('Successfully sent acknowledgment to status endpoint');
      }
    } catch (statusError) {
      console.error('Error sending acknowledgment to status endpoint:', statusError);
      // Continue with the response even if the acknowledgment fails
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Course details generated successfully',
      id: params.id,
      course_id: params.course_id,
      user_id: params.user_id,
      courseDetails: COURSE_DETAILS,
      createdUnits: createdUnits
    })
  } catch (error) {
    console.error('Error processing acknowledgment:', error)
    return NextResponse.json(
      { error: 'Failed to process acknowledgment' },
      { status: 500 }
    )
  }
}

/**
 * Generates detailed course content with units and chapters using Anthropic LLM
 */
async function generateDetailedCourse(genCourse: any) {
  try {
    // Extract modules from the course
    const modules = genCourse.modules as any[]
    
    // Create a prompt for generating detailed course content
    const prompt = `You are an expert course designer. I need you to create a detailed course structure based on the following information:

Course Title: ${genCourse.title}
Course Description: ${genCourse.description}

The course has ${modules.length} modules (weeks), each with the following details:
${modules.map((module, index) => `
Module ${index + 1} (Week ${module.week}):
- Title: ${module.title}
- Objectives: ${Array.isArray(module.objectives) ? module.objectives.join(', ') : module.objectives}
- Time Duration: ${module.timeSpent}
`).join('\n')}

Please create a detailed course structure with the following requirements:
1. Each module should be treated as a unit
2. Each unit should contain multiple relevant chapters
3. Each chapter should have:
   - A clear, descriptive title
   - A brief description of what will be covered
   - Estimated time to complete (in minutes)
   - Key learning points (3-5 bullet points)
   - Suggested resources (books, articles, etc.)
   - A youtube search query to find a relevant video for the chapter

Format your response as a JSON object with the following structure:
{
  "units": [
    {
      "unitNumber": 1,
      "title": "Unit Title",
      "description": "Unit description",
      "chapters": [
        {
          "chapterNumber": 1,
          "title": "Chapter Title",
          "description": "Chapter description",
          "estimatedTime": "30 minutes",
          "learningPoints": ["Point 1", "Point 2", "Point 3"],
          "resources": ["Resource 1", "Resource 2"],
          "youtubeSearchQuery": "Youtube search query"
        }
      ]
    }
  ]
}

Make sure the content is comprehensive, educational, and aligns with the course objectives.`

    // Call Anthropic API to generate the detailed course content
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract the response content
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : JSON.stringify(response.content[0])
    
    console.log('Raw response from Anthropic:', content)
    
    // Extract JSON from the response - improved regex to handle nested objects
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error('Error parsing JSON from response:', parseError)
        
        // Try to extract just the units array if the full JSON is invalid
        const unitsMatch = content.match(/"units"\s*:\s*\[([\s\S]*?)\]/)
        if (unitsMatch) {
          try {
            // Create a valid JSON object with just the units
            const unitsJson = `{"units": ${unitsMatch[0].split('"units":')[1]}}`
            return JSON.parse(unitsJson)
          } catch (unitsParseError) {
            console.error('Error parsing units from response:', unitsParseError)
            throw new Error('Could not parse course structure from response')
          }
        }
        
        throw new Error('Could not parse course structure from response')
      }
    } else {
      // If no JSON found, create a basic structure based on the modules
      console.warn('No JSON found in response, creating basic structure')
      return {
        units: modules.map((module, index) => ({
          unitNumber: index + 1,
          title: module.title,
          description: `Unit ${index + 1}: ${module.title}`,
          chapters: [
            {
              chapterNumber: 1,
              title: `Introduction to ${module.title}`,
              description: `Introduction to ${module.title}`,
              estimatedTime: "30 minutes",
              learningPoints: Array.isArray(module.objectives) ? module.objectives : ["Learning point 1", "Learning point 2"],
              resources: ["Resource 1", "Resource 2"],
              youtubeSearchQuery: `${module.title} tutorial`
            }
          ]
        }))
      }
    }
  } catch (error) {
    console.error('Error generating detailed course:', error)
    throw new Error('Failed to generate detailed course content')
  }
}

/**
 * Helper function to get structured output from Claude LLM
 */
async function strict_output(
  system_prompt: string,
  user_prompt: string,
  output_format: Record<string, string>
) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `${system_prompt}\n\n${user_prompt}`
        }
      ]
    });

    // Extract the response content
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : JSON.stringify(response.content[0]);
    
    // Parse the JSON response
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      // Return a default value if parsing fails
      return { image_search_term: `An image of ${user_prompt.split('about ')[1]}` };
    }
  } catch (error) {
    console.error('Error calling Claude API:', error);
    // Return a default value if API call fails
    return { image_search_term: `An image of ${user_prompt.split('about ')[1]}` };
  }
}

/**
 * Gets a relevant image for the course from Unsplash
 */
async function getCourseImage(courseTitle: string, courseDescription: string) {
  try {
    // Check if Unsplash API key is available
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('UNSPLASH_ACCESS_KEY is not set, using default image')
      return getDefaultImage()
    }

    // Generate a better image search term using Claude LLM
    const imageSearchTerm = await strict_output(
      "you are an AI capable of finding the most relevant, high-quality image for a course",
      `Please provide me with a good image search term for Unsplash API with the title of the course: ${courseTitle} and the description: ${courseDescription}`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    console.log('Generated search term:', imageSearchTerm.image_search_term)

    // Use Unsplash API to search for an image related to the course title
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: courseTitle,
        per_page: 10, // Get more results to choose from
        orientation: 'landscape',
        content_filter: 'high', // Request high-quality content
        order_by: 'relevant' // Get the most relevant results first
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      timeout: 8000 // Increased timeout for better reliability
    })

    // Log API response status
    console.log('Unsplash API Response:', {
      status: response.status,
      resultsCount: response.data?.results?.length || 0
    })

    // Extract the image URL from the response
    if (response.data && response.data.results && response.data.results.length > 0) {
      // Try to find the best image from the results
      const images = response.data.results;
      
      // Prefer images with good descriptions and high likes
      const sortedImages = images.sort((a: any, b: any) => {
        // Prioritize images with descriptions
        const aHasDescription = a.description || a.alt_description;
        const bHasDescription = b.description || b.alt_description;
        
        if (aHasDescription && !bHasDescription) return -1;
        if (!aHasDescription && bHasDescription) return 1;
        
        // Then sort by likes
        return (b.likes || 0) - (a.likes || 0);
      });
      
      const bestImage = sortedImages[0];
      
      console.log('Selected image:', {
        id: bestImage.id,
        description: bestImage.description,
        alt_description: bestImage.alt_description,
        likes: bestImage.likes,
        width: bestImage.width,
        height: bestImage.height
      });
      
      // Use the high-quality version of the image
      return bestImage.urls.regular;
    } else {
      console.warn('No images found for query:', imageSearchTerm.image_search_term);
      return getDefaultImage();
    }
  } catch (error) {
    console.error('Error fetching course image:', error);
    return getDefaultImage();
  }
}

/**
 * Returns a default image URL
 */
function getDefaultImage() {
  // Return a default image related to education/learning
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
}

/**
 * Gets a YouTube video link using the YouTube API
 */
async function getYoutubeVideoLink(searchQuery: string) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('YOUTUBE_API_KEY is not set, using default video');
      return 'https://www.youtube.com/watch?v=KfVpPpXwXqY';
    }

    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
    );

    if (!data || !data.items?.[0]) {
      console.log("youtube fail");
      return 'https://www.youtube.com/watch?v=KfVpPpXwXqY'; // Default educational video
    }

    return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`;
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return 'https://www.youtube.com/watch?v=KfVpPpXwXqY'; // Default educational video
  }
}

/**
 * Creates a chapter with the specified details, generates reading material using Anthropic API,
 * and fetches a YouTube video link using the YouTube API
 * 
 * @param chapterDetails - Object containing chapter details
 * @returns A chapter object with name, reading material, and YouTube video link
 */
async function createChapter(chapterDetails: {
  title: string;
  description: string;
  estimatedTime: string;
  learningPoints: string[];
  resources: string[];
  youtubeSearchQuery: string;
}): Promise<{
  name: string;
  readingMaterial: string;
  youtubeVidLink: string;
}> {
  try {
    console.log('Creating chapter with details:', chapterDetails);
    
    // Generate reading material using Anthropic API
    const readingMaterial = await generateReadingMaterial(chapterDetails);
    
    // Get YouTube video link using the search query
    const youtubeVideoLink = await getYoutubeVideoLink(chapterDetails.youtubeSearchQuery);
    
    // Create the chapter object
    const chapter = {
      name: chapterDetails.title,
      readingMaterial: readingMaterial,
      youtubeVidLink: youtubeVideoLink
    };
    
    // Print the created chapter to console
    console.log('Created chapter:', chapter);
    
    return chapter;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw new Error('Failed to create chapter');
  }
}

/**
 * Generates reading material for a chapter using Anthropic API
 */
async function generateReadingMaterial(chapterDetails: {
  title: string;
  description: string;
  estimatedTime: string;
  learningPoints: string[];
  resources: string[];
}) {
  try {
    // Create a prompt for generating reading material
    const prompt = `You are an expert educational content creator. I need you to create comprehensive reading material for a chapter with the following details:

Chapter Title: ${chapterDetails.title}
Chapter Description: ${chapterDetails.description}
Estimated Time: ${chapterDetails.estimatedTime}
Learning Points: ${chapterDetails.learningPoints.join(', ')}
Suggested Resources: ${chapterDetails.resources.join(', ')}

Please create detailed, educational reading material that covers all the learning points. The content should be well-structured, informative, and engaging. Include examples, explanations, and key concepts.

Format your response as a well-structured educational article with headings, subheadings, and paragraphs.`

    // Call Anthropic API to generate the reading material
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the response content
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : JSON.stringify(response.content[0]);
    
    console.log('Generated reading material for chapter:', chapterDetails.title);
    
    return content;
  } catch (error) {
    console.error('Error generating reading material:', error);
    return `Reading material for ${chapterDetails.title} could not be generated. Please refer to the suggested resources for more information.`;
  }
}

// Helper function to parse YouTube duration format (PT1H2M3S)
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Creates a unit with multiple chapters and stores them in the database
 * 
 * @param course_id - The ID of the course the unit belongs to
 * @param unitDetails - Object containing unit details
 * @returns The created unit with its chapters
 */
async function createUnit(course_id: string, unitDetails: {
  unitNumber: number;
  title: string;
  description: string;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    description: string;
    estimatedTime: string;
    learningPoints: string[];
    resources: string[];
    youtubeSearchQuery: string;
  }>;
}) {
  try {
    console.log(`Creating unit ${unitDetails.unitNumber}: ${unitDetails.title}`);
    
    // Create the unit in the database
    const unit = await prisma.unit.create({
      data: {
        course_id: course_id,
        name: unitDetails.title
      }
    });
    
    console.log(`Created unit with ID: ${unit.unit_id}`);
    
    // Create chapters for the unit
    const createdChapters = [];
    
    for (const chapterDetail of unitDetails.chapters) {
      try {
        // Create chapter using the createChapter helper function
        const chapterContent = await createChapter({
          title: chapterDetail.title,
          description: chapterDetail.description,
          estimatedTime: chapterDetail.estimatedTime,
          learningPoints: chapterDetail.learningPoints,
          resources: chapterDetail.resources,
          youtubeSearchQuery: chapterDetail.youtubeSearchQuery
        });
        
        // Store the chapter in the database
        const chapter = await prisma.chapter.create({
          data: {
            unit_id: unit.unit_id,
            name: chapterContent.name,
            youtubeVidLink: chapterContent.youtubeVidLink,
            readingMaterial: chapterContent.readingMaterial
          }
        });
        
        console.log(`Created chapter with ID: ${chapter.chapter_id}`);
        createdChapters.push(chapter);
      } catch (chapterError) {
        console.error(`Error creating chapter ${chapterDetail.chapterNumber}:`, chapterError);
        // Continue with other chapters even if one fails
      }
    }
    
    // Fetch the updated unit with its chapters
    const updatedUnit = await prisma.unit.findUnique({
      where: {
        unit_id: unit.unit_id
      },
      include: {
        chapters: true
      }
    });
    
    if (!updatedUnit) {
      throw new Error(`Failed to fetch updated unit with ID: ${unit.unit_id}`);
    }
    
    console.log(`Fetched unit with ${updatedUnit.chapters.length} chapters`);
    
    // Return the updated unit with its chapters
    return updatedUnit;
  } catch (error) {
    console.error('Error creating unit:', error);
    throw new Error(`Failed to create unit ${unitDetails.unitNumber}`);
  }
} 