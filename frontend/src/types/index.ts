export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'SUPER_ADMIN';
  profile_image?: string;
  is_verified: boolean;
  is_active: boolean;
  trust_score: number;
  bio?: string;
  created_at?: string;
}

export interface UserPreferences {
  preferred_categories: string[];
  preferred_radius: number;
  preferred_budget: number;
  preferred_style: string;
  preferred_language: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image_url?: string;
}

export interface ListingImage {
  id?: string;
  image_url: string;
  sort_order: number;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  condition: string;
  price_per_day: number;
  price_per_week?: number;
  price_per_month?: number;
  security_deposit: number;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REPORTED';
  verification_status: string;
  rules?: string;
  specifications?: Record<string, any>;
  delivery_available: boolean;
  pickup_available: boolean;
  rating: number;
  review_count: number;
  images: ListingImage[];
  owner?: User;
  created_at?: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  rental_amount: number;
  delivery_fee: number;
  protection_fee: number;
  security_deposit: number;
  platform_fee: number;
  total_amount: number;
  delivery_type: 'DELIVERY' | 'PICKUP';
  delivery_address?: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED';
  created_at?: string;
  listing?: Listing;
  renter?: User;
  owner?: User;
}

export interface Review {
  id: string;
  booking_id?: string;
  reviewer_id: string;
  reviewee_id?: string;
  listing_id: string;
  rating: number;
  comment: string;
  created_at?: string;
  reviewer?: User;
}

export interface AISetupBundleItem {
  listing: Listing;
  match_percentage: number;
  reason: string;
  monthly_price: number;
  distance_km: number;
}

export interface AISetupBundleResponse {
  title: string;
  summary: string;
  extracted_needs: {
    raw_query: string;
    target_items: string[];
    categories: string[];
    budget: number;
    duration_months: number;
    radius_km: number;
    city: string;
  };
  total_monthly_cost: number;
  total_deposit: number;
  match_score: number;
  items: AISetupBundleItem[];
}

export interface AIInspectionResponse {
  id: string;
  listing_id: string;
  condition_score: number;
  condition_grade: string;
  detected_defects: Array<{
    type: string;
    severity: string;
    location: string;
    confidence: number;
    notes: string;
  }>;
  inspection_summary: string;
  pre_vs_post_comparison?: {
    pre_rental_score: number;
    post_rental_score: number;
    delta: number;
    new_defects_count: number;
    deposit_impact: string;
  };
  created_at?: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  description: string;
  evidence: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  admin_notes?: string;
  resolution?: string;
  created_at?: string;
  resolved_at?: string;
  booking?: Booking;
  initiator?: User;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at?: string;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  is_read: boolean;
  created_at?: string;
  sender?: User;
}

export interface ConversationItem {
  id: string;
  listing_id?: string;
  participant1_id: string;
  participant2_id: string;
  created_at?: string;
  updated_at?: string;
  listing?: Listing;
  participant1?: User;
  participant2?: User;
  latest_message?: MessageItem;
  unread_count: number;
}

export interface TamilNaduPincode {
  pincode: string;
  area: string;
  district: string;
  lat: number;
  lng: number;
}

export interface NavigationRoute {
  distance_km: number;
  eta_minutes: number;
  traffic_condition: string;
  waypoints: Array<{ lat: number; lng: number }>;
  directions: string[];
}

