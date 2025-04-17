import { NextResponse } from 'next/server'
import { strict_output } from '@/lib/gpt'
import axios from 'axios'

// Function to get course image
async function getCourseImage(courseTitle: string) {
  try {
    // Check if Unsplash API key is available
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      console.warn('UNSPLASH_ACCESS_KEY is not set, using default image')
      return getDefaultImage()
    }

    // Generate a better image search term using Claude LLM
    const imageSearchTerm = await strict_output(
      "you are an AI capable of finding the most relevant image for a course",
      `Please provide a good image search term for the title of a course about ${courseTitle}. This search term will be fed into the unsplash API, so make sure it is a good search term that will return good results`,
      {
        image_search_term: "a good search term for the title of the course",
      }
    );

    console.log('Generated search term:', imageSearchTerm.image_search_term)

    // Use Unsplash API to search for an image related to the course title
    const response = await axios.get(`https://api.unsplash.com/search/photos`, {
      params: {
        query: imageSearchTerm.image_search_term,
        per_page: 1,
        orientation: 'landscape'
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      },
      timeout: 5000 // 5 second timeout
    })

    // Log API response status
    console.log('Unsplash API Response:', {
      status: response.status,
      resultsCount: response.data?.results?.length || 0
    })

    // Extract the image URL from the response
    if (response.data && response.data.results && response.data.results.length > 0) {
      const image = response.data.results[0]
      console.log('Selected image:', {
        id: image.id,
        description: image.description,
        alt_description: image.alt_description
      })
      return image.urls.regular
    } else {
      console.warn('No images found for query:', courseTitle)
      return getDefaultImage()
    }
  } catch (error) {
    console.error('Error fetching course image:', error)
    return getDefaultImage()
  }
}

function getDefaultImage() {
  return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseTitle = searchParams.get('title') || 'Introduction to Python Programming'

    console.log('Testing image generation for course:', courseTitle)
    
    // Check environment variables
    console.log('Environment check:', {
      hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY
    })
    
    const imageUrl = await getCourseImage(courseTitle)
    
    return NextResponse.json({
      success: true,
      courseTitle,
      imageUrl,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Test failed with error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      },
      { status: 500 }
    )
  }
} 