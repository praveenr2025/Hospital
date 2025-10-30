// frontend/pages/api/api.ts

// 1. Use a 'type' alias with Record<string, any> to allow custom keys (like Authorization)
type CustomHeaders = HeadersInit & Record<string, any>;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  
  // 2. Initialize Headers using the CustomHeaders type
  const headers: CustomHeaders = {
    "Content-Type": "application/json",
  };
  
  // Safely merge existing headers from options
  const existingHeaders = (options.headers || {}) as CustomHeaders;
  Object.assign(headers, existingHeaders);
  
  // 3. Client-Side Only: Add Authorization Token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hospitalToken');
    if (token) {
      // TypeScript is now happy to assign to 'Authorization'
      headers.Authorization = `Bearer ${token}`; 
    }
  }
  
  // 4. Prepare and Execute Fetch
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options, 
    headers: headers, 
    method: options.method || "GET",
    // Stringify body if it's an object/array
    body: (options.body && typeof options.body !== 'string') ? JSON.stringify(options.body) : (options.body as string),
  });

  // 5. Handle Non-OK Responses
  if (!res.ok) {
    try {
        const errorBody = await res.json();
        throw new Error(errorBody.message || `API call failed: ${res.status} ${res.statusText}`);
    } catch (e) {
        // Fallback for non-JSON errors
        throw new Error(`API call failed: ${res.status} ${res.statusText}`);
    }
  }

  return res.json();
};