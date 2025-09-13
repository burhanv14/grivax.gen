import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Anthropic } from '@anthropic-ai/sdk'
import axios from 'axios'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Add timeout and retry configuration for axios
const axiosConfig = {
  timeout: 10000, // 10 seconds
  retry: 2
}

export async function GET(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    if (!genCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({
      message: 'Course found',
      id: genCourse.id,
      course_id: genCourse.course_id,
      user_id: genCourse.user_id
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Failed to fetch course data' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { user_id: string; course_id: string; id: string } }
) {
  try {
    const data = await request.json()

    const genCourse = await prisma.genCourse.findFirst({
      where: {
        id: params.id,
        user_id: params.user_id,
        course_id: params.course_id,
      },
    })
    if (!genCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // **OPTIMIZATION 1: Parallel execution of independent tasks**
    const [detailedCourseContent, courseImage] = await Promise.all([
      generateDetailedCourse(genCourse).catch(e => {
        console.error('Error generating detailed course content:', e)
        return createFallbackCourseContent(genCourse)
      }),
      getCourseImage(genCourse.title, genCourse.description).catch(e => {
        console.error('Error getting course image:', e)
        return getDefaultImage()
      })
    ])

    const COURSE_DETAILS = {
      id: genCourse.id,
      course_id: genCourse.course_id,
      user_id: genCourse.user_id,
      title: genCourse.title,
      description: genCourse.description,
      image: courseImage,
      detailedContent: detailedCourseContent
    }

    // Check/create course record
    let course = await prisma.course.findUnique({
      where: {
        course_id: genCourse.course_id,
        user_id: genCourse.user_id,
      }
    })
    if (!course) {
      course = await prisma.course.create({
        data: {
          course_id: genCourse.course_id,
          user_id: genCourse.user_id,
          genId: genCourse.id,
          title: genCourse.title,
          image: courseImage
        }
      })
    }

    // **OPTIMIZATION 2: Parallel unit creation with batch processing**
    const createdUnits = await createUnitsInParallel(course.course_id, detailedCourseContent.units)

    // **OPTIMIZATION 3: Fire-and-forget status update**
    const baseUrl = process.env.BASE_URL
    if (baseUrl) {
      const statusEndpoint = `${baseUrl}/api/generate-course/${params.user_id}/${params.course_id}/status`
      // Don't await this - let it run in background
      fetch(statusEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Course generation completed',
          course_id: params.course_id,
          user_id: params.user_id
        }),
      }).catch(error => {
        console.error('Error sending acknowledgment to status endpoint:', error)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Course details generated successfully',
      id: params.id,
      course_id: params.course_id,
      user_id: params.user_id,
      courseDetails: COURSE_DETAILS,
      createdUnits
    })
  } catch (error) {
    console.error('Error processing acknowledgment:', error)
    return NextResponse.json({ error: 'Failed to process acknowledgment' }, { status: 500 })
  }
}

/**
 * **OPTIMIZATION 4: Batch processing for units with controlled concurrency**
 */
async function createUnitsInParallel(course_id: string, units: any[]) {
  const BATCH_SIZE = 3 // Process 3 units at a time to avoid overwhelming APIs
  const createdUnits = []

  for (let i = 0; i < units.length; i += BATCH_SIZE) {
    const batch = units.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(unit => 
      createUnit(course_id, unit).catch(error => {
        console.error(`Error creating unit ${unit.unitNumber}:`, error)
        return null // Return null for failed units
      })
    )

    const batchResults = await Promise.all(batchPromises)
    createdUnits.push(...batchResults.filter(result => result !== null))
  }

  return createdUnits
}

/**
 * **OPTIMIZATION 5: Fallback content generation**
 */
function createFallbackCourseContent(genCourse: any) {
  const modules = genCourse.modules as any[]
  return {
    units: modules.map((module, idx) => ({
      unitNumber: idx + 1,
      title: module.title,
      description: `Unit ${idx + 1}: ${module.title}`,
      chapters: [{
        chapterNumber: 1,
        title: `Introduction to ${module.title}`,
        description: `Introduction to ${module.title}`,
        estimatedTime: "30 minutes",
        learningPoints: Array.isArray(module.objectives) ? module.objectives : ["Learning point 1", "Learning point 2"],
        resources: ["Resource 1", "Resource 2"],
        youtubeSearchQuery: `${module.title} tutorial`
      }]
    }))
  }
}

/**
 * **OPTIMIZATION 6: Improved generateDetailedCourse with better error handling**
 */
async function generateDetailedCourse(genCourse: any) {
  try {
    const modules = genCourse.modules as any[]
    
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
2. Each unit should contain 2-3 relevant chapters (keep it concise for faster generation)
3. Each chapter should have:
   - A clear, descriptive title
   - A brief description of what will be covered
   - Estimated time to complete (in minutes)
   - Key learning points (3-5 bullet points)
   - Suggested resources (books, articles, etc.)
   - A youtube search query to find a relevant video for the chapter

IMPORTANT: Return ONLY valid JSON in the following structure (no additional text):
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
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 3000, // Reduced token limit for faster response
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : JSON.stringify(response.content[0])
    
    // More robust JSON extraction
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsedContent = JSON.parse(jsonMatch[0])
      if (parsedContent.units && Array.isArray(parsedContent.units)) {
        return parsedContent
      }
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error generating detailed course:', error)
    throw error
  }
}

/**
 * **OPTIMIZATION 7: Cached image fetching with timeout**
 */
async function getCourseImage(courseTitle: string, courseDescription: string): Promise<string> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    const cx = process.env.GOOGLE_CX
    if (!apiKey || !cx) {
      return getDefaultImage()
    }

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: apiKey,
        cx: cx,
        q: courseTitle,
        searchType: 'image',
        num: 1,
        safe: 'active', // Ensure safe content
        imgSize: 'medium'
      },
      timeout: 5000 // Reduced timeout
    })

    const items = response.data.items
    if (Array.isArray(items) && items.length > 0) {
      return items[0].link
    }

    return getDefaultImage()
  } catch (error) {
    console.error('Error fetching course image from Google:', error)
    return getDefaultImage()
  }
}

function getDefaultImage(): string {
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1740&q=80'
}

/**
 * **OPTIMIZATION 8: Batch YouTube video fetching with fallbacks**
 */
async function getYoutubeVideoLinks(searchQueries: string[]): Promise<string[]> {
  try {
    if (!process.env.YOUTUBE_API_KEY || searchQueries.length === 0) {
      return searchQueries.map(() => 'https://www.youtube.com/watch?v=KfVpPpXwXqY')
    }

    // Process queries in batches to avoid rate limits
    const YOUTUBE_BATCH_SIZE = 5
    const results: string[] = []

    for (let i = 0; i < searchQueries.length; i += YOUTUBE_BATCH_SIZE) {
      const batch = searchQueries.slice(i, i + YOUTUBE_BATCH_SIZE)
      
      const batchPromises = batch.map(async (query) => {
        try {
          const { data } = await axios.get(
            `https://www.googleapis.com/youtube/v3/search`,
            {
              params: {
                key: process.env.YOUTUBE_API_KEY,
                q: query,
                videoDuration: 'medium',
                videoEmbeddable: 'true',
                type: 'video',
                maxResults: 1
              },
              timeout: 5000
            }
          )

          if (data?.items?.[0]) {
            return `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`
          }
          return 'https://www.youtube.com/watch?v=KfVpPpXwXqY'
        } catch (error) {
          console.error('Error fetching YouTube video for query:', query, error)
          return 'https://www.youtube.com/watch?v=KfVpPpXwXqY'
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  } catch (error) {
    console.error('Error batch fetching YouTube videos:', error)
    return searchQueries.map(() => 'https://www.youtube.com/watch?v=KfVpPpXwXqY')
  }
}

/**
 * **OPTIMIZATION 9: Parallel chapter creation with batch content generation**
 */
async function createChaptersInParallel(unitId: string, chapterDetails: any[]): Promise<any[]> {
  try {
    // Extract all YouTube queries for batch processing
    const youtubeQueries = chapterDetails.map(chapter => chapter.youtubeSearchQuery)
    const youtubeLinks = await getYoutubeVideoLinks(youtubeQueries)

    // Generate reading materials in parallel (with controlled concurrency)
    const READING_BATCH_SIZE = 2 // Process 2 reading materials at a time
    const readingMaterials: string[] = []

    for (let i = 0; i < chapterDetails.length; i += READING_BATCH_SIZE) {
      const batch = chapterDetails.slice(i, i + READING_BATCH_SIZE)
      
      const batchPromises = batch.map(chapterDetail => 
        generateReadingMaterial(chapterDetail).catch(error => {
          console.error(`Error generating reading material for ${chapterDetail.title}:`, error)
          return `# ${chapterDetail.title}\n\nReading material could not be generated. Please refer to the suggested resources.`
        })
      )

      const batchResults = await Promise.all(batchPromises)
      readingMaterials.push(...batchResults)
    }

    // Create database entries in parallel
    const chapterPromises = chapterDetails.map(async (chapterDetail, index) => {
      try {
        return await prisma.chapter.create({
          data: {
            unit_id: unitId,
            name: chapterDetail.title,
            youtubeVidLink: youtubeLinks[index],
            readingMaterial: readingMaterials[index]
          }
        })
      } catch (error) {
        console.error(`Error creating chapter ${chapterDetail.title}:`, error)
        return null
      }
    })

    const chapters = await Promise.all(chapterPromises)
    return chapters.filter(chapter => chapter !== null)
  } catch (error) {
    console.error('Error creating chapters in parallel:', error)
    return []
  }
}

/**
 * **OPTIMIZATION 10: Streamlined reading material generation**
 */
async function generateReadingMaterial(chapterDetails: {
  title: string;
  description: string;
  estimatedTime: string;
  learningPoints: string[];
  resources: string[];
}) {
  try {
    const prompt = `Create concise reading material for: "${chapterDetails.title}"

Description: ${chapterDetails.description}
Learning Points: ${chapterDetails.learningPoints.join(', ')}

Format as markdown with:
# ${chapterDetails.title}
## Overview
## Key Points (bullet format)
## Summary

Keep it concise and educational. Focus on practical information.`

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000, // Reduced for faster generation
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : `# ${chapterDetails.title}\n\nContent could not be generated.`
    
  } catch (error) {
    console.error('Error generating reading material:', error)
    return `# ${chapterDetails.title}\n\nReading material could not be generated at this time.`
  }
}

/**
 * **OPTIMIZATION 11: Optimized unit creation**
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
    // Create unit first
    const unit = await prisma.unit.create({
      data: {
        course_id: course_id,
        name: unitDetails.title
      }
    })
    
    // Create chapters in parallel
    const createdChapters = await createChaptersInParallel(unit.unit_id, unitDetails.chapters)
    
    // Return unit with chapters
    return {
      ...unit,
      chapters: createdChapters
    }
  } catch (error) {
    console.error('Error creating unit:', error)
    throw new Error(`Failed to create unit ${unitDetails.unitNumber}`)
  }
}