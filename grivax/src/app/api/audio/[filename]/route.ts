import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // For now, we'll just return a mock audio file
    // In a production environment, you would store and retrieve actual audio files
    const mockAudioPath = path.join(process.cwd(), 'public', 'mock-audio.mp3');
    
    // Check if the file exists
    try {
      await fs.access(mockAudioPath);
    } catch (error) {
      // If the file doesn't exist, create a simple mock audio file
      // This is just for development purposes
      const mockAudioBuffer = Buffer.from('mock audio data');
      await fs.writeFile(mockAudioPath, mockAudioBuffer);
    }
    
    // Read the file
    const audioBuffer = await fs.readFile(mockAudioPath);
    
    // Return the audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving audio file:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file' },
      { status: 500 }
    );
  }
} 