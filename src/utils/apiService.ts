export class ApiService {
    private baseUrl: string;
    private headers: HeadersInit;
  
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
      this.headers = {
        "Content-Type": "application/json",
      };
    }
  
    // Helper function for handling fetch requests
    private async request<T>(url: string, options: RequestInit, extractTotal:boolean=false): Promise<{data:T, totalRecords?:number}> {
      try {
        const response = await fetch(`${this.baseUrl}${url}`, options);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
        const data:T = await response.json();
        const totalRecords = extractTotal ? Number(response.headers.get("X-Total-Count")): undefined;
        console.log(response.headers.get("X-Total-Count"), totalRecords,"RES INNER")
        return {data, totalRecords}
      } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
      }
    }
  
    // Generic GET request
    async get<T>(endpoint: string, params?: Record<string, string>,extractTotal?:boolean): Promise<{data:T, totalRecords?:number}> {
      const queryString = params
        ? "?" + new URLSearchParams(params).toString()
        : "";
      return this.request<T>(`${endpoint}${queryString}`, {
        method: "GET",
        headers: this.headers,
      },extractTotal);
    }
  
    // Generic POST request
    async post<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data),
      }).then((res) => res.data);
    }
  
    // Generic PUT request
    async put<T>(endpoint: string, data: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: "PUT",
        headers: this.headers,
        body: JSON.stringify(data),
      }).then((res) => res.data);;
    }
  
    // Generic DELETE request
    async delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, {
        method: "DELETE",
        headers: this.headers,
      }).then((res) => res.data);;
    }
  }
  