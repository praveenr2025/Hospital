// frontend/utils/api.ts
export const API_URL = "http://localhost:5000/api";

export const fetchAPI = async (
  endpoint: string,               // <--- specify string type
  options: RequestInit = {}       // fetch options
): Promise<any> => {              
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",       // for cookies
    headers: { "Content-Type": "application/json", ...options.headers },
    method: options.method || "GET",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return res.json();
};
