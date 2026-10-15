export function getPageContext(): string {
  if (typeof window === 'undefined') return '';
  
  // Get the page title
  const title = document.title;
  
  // Get the main content
  const mainContent = document.querySelector('main')?.textContent || '';
  
  // Get the current URL
  const url = window.location.href;
  
  // Get meta description if available
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Get headings for structure
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    .map(h => h.textContent)
    .join(', ');
  
  return `
Page Title: ${title}
URL: ${url}
Description: ${metaDescription}
Main Headings: ${headings}
Content Summary: ${mainContent.substring(0, 500)}...
  `.trim();
} 