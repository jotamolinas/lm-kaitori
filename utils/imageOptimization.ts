export const getOptimizedImageUrl = (url: string, width?: number): string => {
  if (!url) return '';
  
  // Handle Unsplash images
  if (url.includes('unsplash.com')) {
    let optimizedUrl = url;
    if (!optimizedUrl.includes('auto=format')) {
      optimizedUrl += optimizedUrl.includes('?') ? '&auto=format' : '?auto=format';
    }
    if (width && !optimizedUrl.includes('w=')) {
      optimizedUrl += `&w=${width}`;
    }
    return optimizedUrl;
  }

  // Handle Cloudinary/Firebase if any
  if (url.includes('cloudinary.com') || url.includes('firebasestorage.googleapis.com')) {
    // Basic formatting for external services to webp can be complex,
    // assuming they handle content-negotiation or we append something.
    // For now, ensuring we just return the url or format=webp if possible.
    if (!url.includes('format=webp') && url.includes('?')) {
      return `${url}&format=webp`;
    }
  }

  // Handle local static images by replacing extension with .webp
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url.replace(/\.(png|jpe?g)$/i, '.webp');
  }
  
  return url;
};
