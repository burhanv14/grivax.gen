'use client'
import React, { useState, useEffect } from 'react';

export default function WebsiteLoader() {
  const [firstVideoEnded, setFirstVideoEnded] = useState(false);
  const [showSecondVideo, setShowSecondVideo] = useState(false);

  useEffect(() => {
    if (firstVideoEnded) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowSecondVideo(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [firstVideoEnded]);

  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 transition-opacity duration-500">
      {!showSecondVideo && (
        <video
          autoPlay
          muted
          playsInline
          onEnded={() => setFirstVideoEnded(true)}
          className="w-full h-full object-cover"
        >
          <source src="/door.mp4" type="video/mp4" />
        </video>
      )}
      {showSecondVideo && (
        <video
          key="second-video"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/grivaxvid.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}