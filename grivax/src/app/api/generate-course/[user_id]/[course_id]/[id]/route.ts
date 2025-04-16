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
      courseImage = await getCourseImage(genCourse.title)
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
    
    // Print the course details to console
    console.log('Generated detailed course:', COURSE_DETAILS)
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Course details generated successfully',
      id: params.id,
      course_id: params.course_id,
      user_id: params.user_id,
      courseDetails: COURSE_DETAILS
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
 * Gets a relevant image for the course from Unsplash
 */
async function getCourseImage(courseTitle: string) {
  try {
    // Check if Unsplash API key is available
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('UNSPLASH_ACCESS_KEY is not set, using default image')
      return getDefaultImage()
    }

    // Use Unsplash API to search for an image related to the course title
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: courseTitle,
        per_page: 1,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      timeout: 5000 // 5 second timeout
    })

    // Extract the image URL from the response
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0].urls.regular
    } else {
      // Return a default image if no results found
      console.warn('No images found for query:', courseTitle)
      return getDefaultImage()
    }
  } catch (error) {
    console.error('Error fetching course image:', error)
    // Return a default image if there's an error
    return getDefaultImage()
  }
}

/**
 * Returns a default image URL
 */
function getDefaultImage() {
  // Return a default image related to education/learning
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
} 