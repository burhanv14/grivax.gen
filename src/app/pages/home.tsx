// HomePage.tsx
'use client'
import React, { useEffect, useState } from 'react';
import WebsiteLoader from '../components/websiteLoader';
import NavBar from "../components/nav-bar"
import HeroSection from "../components/hero-section"


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    // Function to check if all content is loaded
    const checkContentLoaded = () => {
      if (document.readyState === 'complete') {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setContentReady(true);
        }, 500);
      }
    };

    // Check immediately
    checkContentLoaded();

    // Add event listener for dynamic content
    window.addEventListener('load', checkContentLoaded);

    // Cleanup
    return () => {
      window.removeEventListener('load', checkContentLoaded);
    };
  }, []);

  // Effect to handle loader dismissal
  useEffect(() => {
    if (contentReady) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 11000); // Delay to ensure videos complete their transition

      return () => clearTimeout(timer);
    }
  }, [contentReady]);

  if (isLoading) {
    return <WebsiteLoader />;
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto">
      <NavBar />
      <HeroSection />
      </div>
    </main>
  );
}