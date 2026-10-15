'use client'

import YouTube from 'react-youtube'

interface YouTubePlayerProps {
  videoUrl: string
}

export function YouTubePlayer({ videoUrl }: YouTubePlayerProps) {
  const videoId = videoUrl.split('v=')[1]?.split('&')[0] || ''

  return (
    <div className="aspect-video w-full">
      <YouTube
        videoId={videoId}
        opts={{
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
          },
        }}
        className="w-full h-full"
      />
    </div>
  )
} 