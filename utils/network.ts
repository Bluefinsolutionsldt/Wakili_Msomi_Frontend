"use client";

export async function testNetworkConnectivity(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return false;
  }
}

export function getNetworkErrorMessage(error: Error): string {
  if (error.message.includes('Failed to fetch')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.name === 'AbortError') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.message.includes('CORS')) {
    return 'Cross-origin request blocked. Please contact support.';
  }
  
  return error.message || 'An unknown network error occurred.';
} 