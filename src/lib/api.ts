const API_URLS = {
  auth: 'https://functions.poehali.dev/4c035b82-8c0e-4dcc-8a5c-fb0f11eee205',
  events: 'https://functions.poehali.dev/4a13bc9e-042e-4ccd-9dde-b7acd90b8ac1',
  users: 'https://functions.poehali.dev/ad1e70ab-7731-4431-b740-22850ef4b847',
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  position: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken() {
    return this.token;
  }

  private async request(url: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['X-Auth-Token'] = this.token;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(login: string, password: string): Promise<AuthResponse> {
    const data = await this.request(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', login, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async verify(): Promise<{ user: User }> {
    return this.request(API_URLS.auth, {
      method: 'POST',
      body: JSON.stringify({ action: 'verify' }),
    });
  }

  async logout() {
    this.clearToken();
  }

  async getEvents() {
    return this.request(API_URLS.events);
  }

  async getEvent(id: string) {
    return this.request(`${API_URLS.events}?id=${id}`);
  }

  async createEvent(event: any) {
    return this.request(API_URLS.events, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async updateEvent(event: any) {
    return this.request(API_URLS.events, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  }

  async deleteEvent(id: string) {
    return this.request(`${API_URLS.events}?id=${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request(API_URLS.users);
  }

  async createUser(user: any) {
    return this.request(API_URLS.users, {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(user: any) {
    return this.request(API_URLS.users, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: number) {
    return this.request(`${API_URLS.users}?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();