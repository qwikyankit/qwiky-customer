import { supabase } from '../config/supabase';
import { User, Service, GuestAddress, CartItem, Order, OrderItem, Transaction, DiscountCode } from '../types';

class SupabaseService {
  // User operations
  async createUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getUserByMobile(mobile: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error) return null;
    return data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // Guest Address operations
  async createGuestAddress(addressData: Partial<GuestAddress>): Promise<GuestAddress> {
    const { data, error } = await supabase
      .from('guest_addresses')
      .insert([{
        ...addressData,
        user_id: addressData.userId,
        address_line_1: addressData.addressLine1,
        address_line_2: addressData.addressLine2,
        postal_code: addressData.postalCode,
        google_place_id: addressData.googlePlaceId,
        is_default: addressData.isDefault
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapGuestAddress(data);
  }

  async getUserAddresses(userId: string): Promise<GuestAddress[]> {
    const { data, error } = await supabase
      .from('guest_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapGuestAddress);
  }

  async updateGuestAddress(id: string, addressData: Partial<GuestAddress>): Promise<GuestAddress> {
    const { data, error } = await supabase
      .from('guest_addresses')
      .update({
        ...addressData,
        address_line_1: addressData.addressLine1,
        address_line_2: addressData.addressLine2,
        postal_code: addressData.postalCode,
        google_place_id: addressData.googlePlaceId,
        is_default: addressData.isDefault,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapGuestAddress(data);
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return data.map(this.mapService);
  }

  async getService(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.mapService(data);
  }

  // Cart operations
  async addToCart(cartData: Partial<CartItem>): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([{
        user_id: cartData.userId,
        service_id: cartData.serviceId,
        quantity: cartData.quantity || 1,
        scheduled_date: cartData.scheduledDate,
        scheduled_time: cartData.scheduledTime
      }])
      .select(`
        *,
        services (*)
      `)
      .single();

    if (error) throw new Error(error.message);
    return this.mapCartItem(data);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        services (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapCartItem);
  }

  async updateCartItem(id: string, cartData: Partial<CartItem>): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: cartData.quantity,
        scheduled_date: cartData.scheduledDate,
        scheduled_time: cartData.scheduledTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        services (*)
      `)
      .single();

    if (error) throw new Error(error.message);
    return this.mapCartItem(data);
  }

  async removeFromCart(id: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  }

  // Discount code operations
  async validateDiscountCode(code: string): Promise<DiscountCode | null> {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error) return null;

    // Check if code is still valid
    const now = new Date();
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;
    const validFrom = new Date(data.valid_from);

    if (now < validFrom || (validUntil && now > validUntil)) {
      return null;
    }

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return null;
    }

    return this.mapDiscountCode(data);
  }

  // Order operations
  async createOrder(orderData: Partial<Order>, orderItems: Partial<OrderItem>[]): Promise<Order> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.userId,
        guest_address_id: orderData.guestAddressId,
        subtotal: orderData.subtotal,
        discount_amount: orderData.discountAmount || 0,
        discount_code_id: orderData.discountCodeId,
        total_amount: orderData.totalAmount,
        scheduled_date: orderData.scheduledDate,
        scheduled_time: orderData.scheduledTime,
        notes: orderData.notes
      }])
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const itemsToInsert = orderItems.map(item => ({
      order_id: order.id,
      service_id: item.serviceId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw new Error(itemsError.message);

    // Update discount code usage if applicable
    if (orderData.discountCodeId) {
      await supabase.rpc('increment_discount_usage', {
        discount_id: orderData.discountCodeId
      });
    }

    return this.getOrder(order.id);
  }

  async getOrder(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        guest_addresses (*),
        discount_codes (*),
        order_items (
          *,
          services (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapOrder(data);
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        guest_addresses (*),
        discount_codes (*),
        order_items (
          *,
          services (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapOrder);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.getOrder(id);
  }

  async updateOrderPaymentStatus(id: string, paymentStatus: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.getOrder(id);
  }

  // Transaction operations
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        order_id: transactionData.orderId,
        payment_gateway: transactionData.paymentGateway,
        gateway_transaction_id: transactionData.gatewayTransactionId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'INR',
        status: transactionData.status || 'pending',
        gateway_response: transactionData.gatewayResponse
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapTransaction(data);
  }

  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...transactionData,
        gateway_transaction_id: transactionData.gatewayTransactionId,
        gateway_response: transactionData.gatewayResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapTransaction(data);
  }

  // Helper methods to map database fields to TypeScript interfaces
  private mapGuestAddress(data: any): GuestAddress {
    return {
      id: data.id,
      userId: data.user_id,
      addressLine1: data.address_line_1,
      addressLine2: data.address_line_2,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      googlePlaceId: data.google_place_id,
      isDefault: data.is_default,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapService(data: any): Service {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      durationMinutes: data.duration_minutes,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapCartItem(data: any): CartItem {
    return {
      id: data.id,
      userId: data.user_id,
      serviceId: data.service_id,
      quantity: data.quantity,
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      service: data.services ? this.mapService(data.services) : undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDiscountCode(data: any): DiscountCode {
    return {
      id: data.id,
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minOrderAmount: data.min_order_amount,
      maxDiscountAmount: data.max_discount_amount,
      usageLimit: data.usage_limit,
      usedCount: data.used_count,
      isActive: data.is_active,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      createdAt: data.created_at
    };
  }

  private mapOrder(data: any): Order {
    return {
      id: data.id,
      userId: data.user_id,
      guestAddressId: data.guest_address_id,
      status: data.status,
      subtotal: data.subtotal,
      discountAmount: data.discount_amount,
      discountCodeId: data.discount_code_id,
      totalAmount: data.total_amount,
      scheduledDate: data.scheduled_date,
      scheduledTime: data.scheduled_time,
      paymentStatus: data.payment_status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      guestAddress: data.guest_addresses ? this.mapGuestAddress(data.guest_addresses) : undefined,
      orderItems: data.order_items ? data.order_items.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        serviceId: item.service_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        service: item.services ? this.mapService(item.services) : undefined,
        createdAt: item.created_at
      })) : undefined,
      discountCode: data.discount_codes ? this.mapDiscountCode(data.discount_codes) : undefined
    };
  }

  private mapTransaction(data: any): Transaction {
    return {
      id: data.id,
      orderId: data.order_id,
      paymentGateway: data.payment_gateway,
      gatewayTransactionId: data.gateway_transaction_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      gatewayResponse: data.gateway_response,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const supabaseService = new SupabaseService();