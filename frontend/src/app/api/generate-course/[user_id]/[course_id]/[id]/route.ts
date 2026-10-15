import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/prisma';
import axios from 'axios';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY');
}

const ai = new GoogleGenAI({});

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

    // ASYNC GENERATION STRATEGY: Return immediately & generate units/channels in background.
    // Frontend will poll enhanced status endpoint for progress.

    ;(async () => {
      try {
        await createUnitsInParallel(course.course_id, detailedCourseContent.units, {
          onUnitCreated: async (unitIndex, unitTitle) => {
            // Could log or update progress fields if desired
          },
          onError: (err) => console.error('Async generation error:', err)
        })

        // Optionally notify status endpoint (fire-and-forget) when done
        const baseUrl = process.env.BASE_URL
        if (baseUrl) {
          const statusEndpoint = `${baseUrl}/api/generate-course/${params.user_id}/${params.course_id}/status`
          fetch(statusEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Course generation completed', course_id: params.course_id, user_id: params.user_id }) }).catch(e => console.error('Status notify failed', e))
        }
      } catch (err) {
        console.error('Background generation failed:', err)
      }
    })()

    return NextResponse.json({
      success: true,
      message: 'Course details generation started',
      id: params.id,
      course_id: params.course_id,
      user_id: params.user_id,
      courseDetails: COURSE_DETAILS,
      started: true
    })
  } catch (error) {
    console.error('Error processing acknowledgment:', error)
    return NextResponse.json({ error: 'Failed to process acknowledgment' }, { status: 500 })
  }
}

/**
 * **OPTIMIZATION 4: Batch processing for units with controlled concurrency**
 */
async function createUnitsInParallel(course_id: string, units: any[], hooks?: { onUnitCreated?: (unitIndex: number, unitTitle: string) => Promise<void> | void; onError?: (error: any) => void }) {
  const BATCH_SIZE = 3 // Process 3 units at a time to avoid overwhelming APIs
  const createdUnits = []

  for (let i = 0; i < units.length; i += BATCH_SIZE) {
    const batch = units.slice(i, i + BATCH_SIZE)
    
    const batchPromises = batch.map(async (unit) => {
      try {
        const created = await createUnit(course_id, unit)
        if (hooks?.onUnitCreated) {
          await hooks.onUnitCreated(unit.unitNumber, unit.title)
        }
        return created
      } catch (error) {
        console.error(`Error creating unit ${unit.unitNumber}:`, error)
        hooks?.onError?.(error)
        return null
      }
    })

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
    const modules = genCourse.modules as any[];
    const prompt = `Return ONLY JSON.
Course Title: ${genCourse.title}
Description: ${genCourse.description}
Modules:
${modules.map((m: any, i: number) => `Week ${m.week}: ${m.title} Objectives: ${Array.isArray(m.objectives) ? m.objectives.join(', ') : m.objectives} Time: ${m.timeSpent}`).join('\n')}

JSON structure:
{
  "units":[
    {
      "unitNumber":1,
      "title":"Unit Title",
      "description":"Unit description",
      "chapters":[
        {
          "chapterNumber":1,
          "title":"Chapter Title",
          "description":"Chapter description",
          "estimatedTime":"30 minutes",
          "learningPoints":["Point 1","Point 2","Point 3"],
          "resources":["Resource 1","Resource 2"],
          "youtubeSearchQuery":"query"
        }
      ]
    }
  ]
}`;

    const gen = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: 'Return valid JSON only.', thinkingConfig: { thinkingBudget: 0 } },
    });

    const text = gen.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Invalid response format');
    const parsed = JSON.parse(match[0]);
    if (!parsed.units || !Array.isArray(parsed.units)) throw new Error('Units missing');
    return parsed;
  } catch (e) {
    console.error('generateDetailedCourse error:', e);
    throw e;
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
  title: string; description: string; estimatedTime: string;
  learningPoints: string[]; resources: string[];
}) {
  try {
    const prompt = `Create concise markdown reading material.

Title: ${chapterDetails.title}
Description: ${chapterDetails.description}
Learning Points: ${chapterDetails.learningPoints.join(', ')}

Format:
# ${chapterDetails.title}
## Overview
## Key Points
## Summary
`;
    const gen = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: 'Return markdown only.', thinkingConfig: { thinkingBudget: 0 } },
    });
    return gen.text || `# ${chapterDetails.title}\n\nContent unavailable.`;
  } catch (e) {
    console.error('generateReadingMaterial error:', e);
    return `# ${chapterDetails.title}\n\nReading material could not be generated.`;
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
    
    // Create chapters and test in parallel
    const [createdChapters, test] = await Promise.all([
      createChaptersInParallel(unit.unit_id, unitDetails.chapters),
      generateUnitTest(unit.unit_id, unitDetails)
    ])
    
    // Return unit with chapters and test
    return {
      ...unit,
      chapters: createdChapters,
      test: test
    }
  } catch (error) {
    console.error('Error creating unit:', error)
    throw new Error(`Failed to create unit ${unitDetails.unitNumber}`)
  }
}

/**
 * Generate flashcard test for a unit
 */
async function generateUnitTest(unit_id: string, unitDetails: any) {
  try {
    const prompt = `Return ONLY JSON.
Unit: ${unitDetails.title}
Description: ${unitDetails.description}
Chapters:
${unitDetails.chapters.map((c: any, i: number) => `${i + 1}. ${c.title} - ${c.description}`).join('\n')}

Format:
{
  "questions":[
    {
      "id":1,
      "question":"Question?",
      "options":{"A":"...","B":"...","C":"...","D":"..."},
      "correctAnswer":"A",
      "explanation":"..."
    }
  ]
}`;
    const gen = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: 'Return valid JSON only.', thinkingConfig: { thinkingBudget: 0 } },
    });
    let questions: any[] = [];
    try {
      const text = gen.text || '';
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      }
      if (!questions.length) questions = createFallbackTestQuestions(unitDetails.title);
    } catch {
      questions = createFallbackTestQuestions(unitDetails.title);
    }
    return await prisma.test.create({ data: { unit_id, questions } });
  } catch (e) {
    console.error('generateUnitTest error:', e);
    const questions = createFallbackTestQuestions(unitDetails.title);
    return await prisma.test.create({ data: { unit_id, questions } });
  }
}

function createFallbackTestQuestions(unitTitle: string) {
  return [
    {
      id: 1,
      question: `What is the main topic covered in ${unitTitle}?`,
      options: {
        A: "Basic concepts",
        B: "Advanced techniques", 
        C: "Historical background",
        D: "All of the above"
      },
      correctAnswer: "D",
      explanation: "This unit covers multiple aspects of the topic."
    },
    {
      id: 2,
      question: `Which of the following is most important in ${unitTitle}?`,
      options: {
        A: "Memorization",
        B: "Understanding concepts",
        C: "Speed of completion",
        D: "Following instructions"
      },
      correctAnswer: "B",
      explanation: "Understanding the underlying concepts is most important for learning."
    },
    {
      id: 3,
      question: `What should you focus on when studying ${unitTitle}?`,
      options: {
        A: "Only the main points",
        B: "Only the details",
        C: "Both main points and details",
        D: "Only practical applications"
      },
      correctAnswer: "C",
      explanation: "A comprehensive understanding requires both main concepts and supporting details."
    }
  ]
}