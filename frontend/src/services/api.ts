import {
  User, Listing, Booking, Review, AISetupBundleResponse,
  AIInspectionResponse, Dispute, NotificationItem, ConversationItem,
  MessageItem, Category, TamilNaduPincode, NavigationRoute
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined'
    ? '/api'
    : 'http://127.0.0.1:8000/api'
);

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('tempora_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let message = errorData.message || errorData.detail;
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const fieldMsgs = errorData.errors.map((e: any) => {
            const loc = (e.loc || []).filter((l: any) => l !== 'body').join('.');
            return loc ? `${loc}: ${e.msg}` : e.msg;
          }).join('; ');
          if (fieldMsgs) message = fieldMsgs;
        }
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn(`[TEMPORA API] Cannot reach backend at ${url}. Ensure FastAPI is running on port 8000.`);
        throw new Error(`Cannot reach server at ${url}. Ensure the FastAPI backend is running on port 8000.`);
      }
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
      throw err;
    }
  }


  // ----------------- Auth -----------------
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(name: string, email: string, password: string, role: string = 'CUSTOMER', phone?: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone })
    });
  }

  async googleAuth(credential: string, email?: string, name?: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, email, name })
    });
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  // ----------------- Listings & Categories -----------------
  async getCategories(): Promise<Category[]> {
    return this.request('/listings/categories/all');
  }

  async getListings(params: Record<string, any> = {}): Promise<Listing[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    return this.request(`/listings${queryString ? `?${queryString}` : ''}`);
  }

  async getListingDetail(id: string): Promise<Listing> {
    return this.request(`/listings/${id}`);
  }

  async createListing(data: any): Promise<Listing> {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateListing(id: string, data: any): Promise<Listing> {
    return this.request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteListing(id: string): Promise<{ success: boolean }> {
    return this.request(`/listings/${id}`, {
      method: 'DELETE'
    });
  }

  // ----------------- Uploads -----------------
  async uploadImage(file: File): Promise<{ url: string; filename?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('tempora_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/upload`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(`Cannot reach server at ${url}. Ensure the FastAPI backend is running on port 8000.`);
      }
      throw err;
    }
  }

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    const token = localStorage.getItem('tempora_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}/upload/multiple`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.urls || [];
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(`Cannot reach server at ${url}. Ensure the FastAPI backend is running on port 8000.`);
      }
      throw err;
    }
  }

  // ----------------- Search -----------------
  async searchMarketplace(params: Record<string, any>): Promise<Listing[]> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    return this.request(`/search?${searchParams.toString()}`);
  }

  // ----------------- AI Signature Features -----------------
  async getAIRecommendationBundle(query: string, lat?: number, lng?: number): Promise<AISetupBundleResponse> {
    return this.request('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({
        query,
        latitude: lat || 13.0827,
        longitude: lng || 80.2707
      })
    });
  }

  async getClothingLook(occasion: string = 'Job Interview', gender: string = 'Unisex', budget: number = 1500): Promise<any> {
    return this.request(`/ai/clothing-look?occasion=${encodeURIComponent(occasion)}&gender=${encodeURIComponent(gender)}&budget=${budget}`, {
      method: 'POST'
    });
  }

  async getFurnitureHome(homeType: string = '1BHK', durationMonths: number = 6, style: string = 'Modern', budget: number = 5000): Promise<any> {
    return this.request(`/ai/furniture-home?home_type=${encodeURIComponent(homeType)}&duration_months=${durationMonths}&style=${encodeURIComponent(style)}&budget=${budget}`, {
      method: 'POST'
    });
  }

  async inspectItem(data: { listing_id: string; image_urls: string[]; inspection_type?: string; booking_id?: string }): Promise<AIInspectionResponse> {
    return this.request('/ai/inspect', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ----------------- Bookings -----------------
  async createBooking(data: {
    listing_id: string;
    start_date: string;
    end_date: string;
    delivery_type: 'DELIVERY' | 'PICKUP';
    delivery_address?: string;
  }): Promise<Booking> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getBookings(role: 'renter' | 'owner' = 'renter'): Promise<Booking[]> {
    return this.request(`/bookings?role=${role}`);
  }

  async getBookingDetail(id: string): Promise<Booking> {
    return this.request(`/bookings/${id}`);
  }

  async updateBookingStatus(id: string, newStatus: string): Promise<Booking> {
    return this.request(`/bookings/${id}/status?new_status=${encodeURIComponent(newStatus)}`, {
      method: 'PUT'
    });
  }

  // ----------------- Payments -----------------
  async processPayment(bookingId: string, paymentMethod: string = 'card'): Promise<any> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, payment_method: paymentMethod })
    });
  }

  // ----------------- Reviews -----------------
  async getReviews(listingId: string): Promise<Review[]> {
    return this.request(`/reviews/listing/${listingId}`);
  }

  async createReview(data: { listing_id: string; rating: number; comment: string; booking_id?: string }): Promise<Review> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ----------------- Wishlists -----------------
  async getWishlist(): Promise<Listing[]> {
    return this.request('/wishlists');
  }

  async toggleWishlist(listingId: string): Promise<{ saved: boolean; message: string }> {
    return this.request(`/wishlists/toggle/${listingId}`, {
      method: 'POST'
    });
  }

  // ----------------- Chat -----------------
  async getConversations(): Promise<ConversationItem[]> {
    return this.request('/chat/conversations');
  }

  async getMessages(conversationId: string): Promise<MessageItem[]> {
    return this.request(`/chat/conversations/${conversationId}/messages`);
  }

  async sendMessage(receiverId: string, content: string, listingId?: string, imageUrl?: string): Promise<MessageItem> {
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id: receiverId,
        listing_id: listingId,
        content,
        image_url: imageUrl
      })
    });
  }

  // ----------------- Notifications -----------------
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // ----------------- Owner Portal -----------------
  async getOwnerDashboard(): Promise<any> {
    return this.request('/owner/dashboard');
  }

  async getOwnerListings(): Promise<Listing[]> {
    return this.request('/owner/listings');
  }

  async getOwnerBookings(): Promise<Booking[]> {
    return this.request('/owner/bookings');
  }

  // ----------------- Admin Portal -----------------
  async getAdminDashboard(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  async getAdminUsers(query?: string, role?: string, status?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    return this.request(`/admin/users?${params.toString()}`);
  }

  async updateAdminUserStatus(userId: string, action: string, newRole?: string): Promise<any> {
    const params = new URLSearchParams({ action });
    if (newRole) params.append('new_role', newRole);
    return this.request(`/admin/users/${userId}/status?${params.toString()}`, {
      method: 'PUT'
    });
  }

  async getAdminListings(status?: string, category?: string): Promise<Listing[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    return this.request(`/admin/listings?${params.toString()}`);
  }

  async moderateListing(listingId: string, action: string, reason?: string): Promise<any> {
    const params = new URLSearchParams({ action });
    if (reason) params.append('reason', reason);
    return this.request(`/admin/listings/${listingId}/moderation?${params.toString()}`, {
      method: 'PUT'
    });
  }

  async getAdminDisputes(status?: string): Promise<Dispute[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return this.request(`/admin/disputes?${params.toString()}`);
  }

  async resolveDispute(disputeId: string, resolution: string, adminNotes?: string): Promise<any> {
    const params = new URLSearchParams({ resolution });
    if (adminNotes) params.append('admin_notes', adminNotes);
    return this.request(`/admin/disputes/${disputeId}/resolve?${params.toString()}`, {
      method: 'PUT'
    });
  }

  async getAdminMapData(): Promise<any> {
    return this.request('/admin/map-data');
  }

  async getAdminAuditLogs(): Promise<any[]> {
    return this.request('/admin/audit-logs');
  }

  // ----------------- Maps & Delivery -----------------
  async getTamilNaduPincodes(query?: string, district?: string): Promise<TamilNaduPincode[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (district) params.append('district', district);
    return this.request(`/maps/pincodes/tn?${params.toString()}`);
  }

  async getNavigationRoute(originLat: number, originLng: number, destLat: number, destLng: number): Promise<NavigationRoute> {
    return this.request('/maps/navigate', {
      method: 'POST',
      body: JSON.stringify({
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng
      })
    });
  }

  async calculateDelivery(pickupLat: number, pickupLng: number, dropLat: number, dropLng: number): Promise<any> {
    return this.request('/maps/calculate-delivery', {
      method: 'POST',
      body: JSON.stringify({
        pickup_lat: pickupLat,
        pickup_lng: pickupLng,
        drop_lat: dropLat,
        drop_lng: dropLng
      })
    });
  }

  async getMapConfig(): Promise<any> {
    return this.request('/maps/config');
  }
}

export const api = new ApiService();
