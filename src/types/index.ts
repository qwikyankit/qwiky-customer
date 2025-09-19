export interface User {
  id: string;
  mobile: string;
  name?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GuestAddress {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  categoryId: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  serviceId: string;
  quantity: number;
  scheduledDate?: string;
  scheduledTime?: string;
  service?: Service;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  guestAddressId?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  subtotal: number;
  discountAmount: number;
  discountCodeId?: string;
  totalAmount: number;
  scheduledDate: string;
  scheduledTime: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  guestAddress?: GuestAddress;
  orderItems?: OrderItem[];
  discountCode?: DiscountCode;
}

export interface OrderItem {
  id: string;
  orderId: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service?: Service;
  createdAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  paymentGateway: string;
  gatewayTransactionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerDetails: {
    customerId: string;
    customerPhone: string;
    customerName?: string;
    customerEmail?: string;
  };
  returnUrl?: string;
  notifyUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GoogleMapsPlace {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}