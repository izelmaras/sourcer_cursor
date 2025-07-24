// Mock API for development
export const mockOgPreview = async (url: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return mock data
  return {
    success: true,
    ogTitle: 'Mock Title',
    ogDescription: 'Mock description for development',
    ogImage: undefined,
    requestUrl: url,
  };
}; 