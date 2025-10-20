import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
interface HttpClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}
class HttpClient {
  private static clientInstance: AxiosInstance;
  private static serverInstance: AxiosInstance;
  private static getBaseURL(): string {
    if (typeof window === 'undefined') {
      return process.env.BACKEND_API_BASE_URL || '';
    }
    return '/api';
  }
  private static initClientInstance(options?: HttpClientOptions): AxiosInstance {
    this.clientInstance = axios.create({
      baseURL: this.getBaseURL(),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    this.clientInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error),
    );
    return this.clientInstance;
  }
  private static initServerInstance(options?: HttpClientOptions) {
    this.serverInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    return this.serverInstance;
  }
  static async clientPost<T, D = any>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    if (!this.clientInstance) {
      this.initClientInstance();
    }
    try {
      if (data instanceof FormData) {
        config = {
          ...config,
          headers: {
            ...config?.headers,
          },
          transformRequest: [],
        };
      }
      const response = await this.clientInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  static async serverPost<T, D = any>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    if (!this.serverInstance) {
      this.initServerInstance();
    }
    try {
      if (data instanceof FormData) {
        config = {
          ...config,
          headers: {
            ...config?.headers,
          },
          transformRequest: [],
        };
      }
      const response = await this.serverInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  static async clientDelete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (!this.clientInstance) {
      this.initClientInstance();
    }
    try {
      const response = await this.clientInstance.delete<T>(url, { ...config, data });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  static async serverDelete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (!this.serverInstance) {
      this.initServerInstance();
    }
    try {
      const response = await this.serverInstance.delete<T>(url, { ...config, data });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  static async clientGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    if (!this.clientInstance) {
      this.initClientInstance();
    }
    try {
      const response = await this.clientInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  static async clientPut<T, D = any>(url: string, data: D, config?: AxiosRequestConfig): Promise<T> {
    if (!this.clientInstance) {
      this.initClientInstance();
    }
    try {
      const response = await this.clientInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  private static handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const customError = {
        message: error.message,
        status: error.response?.status || 500,
        data: error.response?.data || null,
      };
      console.log('HTTP Request Error:', customError);
      throw customError;
    } else {
      console.log('Unexpected Error:', error);
      throw { message: 'Unexpected Error', status: 500 };
    }
  }
}
export async function fetchWithAbort<T>(url: string, body: any = null, method: 'POST' | 'GET' | 'DELETE' | 'PUT' = 'POST', headers: Record<string, string> = {}): Promise<T> {
  const controller = new AbortController();

  try {
    const options: RequestInit = {
      method,
      headers: body instanceof FormData ? headers : { 'Content-Type': 'application/json', ...headers },
      signal: controller.signal,
    };
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      options.body = body instanceof FormData ? body : JSON.stringify(body);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!data) {
      throw new Error('Invalid API response');
    }
    return data;
  } catch (error) {
    console.log('Fetch Error:', error);
    throw error;
  }
}

export { HttpClient };
