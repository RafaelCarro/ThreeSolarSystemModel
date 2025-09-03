export const getAssetPath = (path) => {
  // Get the base path from the current page URL
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Ensure path doesn't start with '/' and base path ends with '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = basePath.endsWith('/') ? basePath : basePath + '/';
  
  return cleanBase + cleanPath;
};