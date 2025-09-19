// Simple text resources with hardcoded English strings
// This replaces the complex internationalization system to avoid errors

export const getText = (key: string): string => {
  const texts: Record<string, string> = {
    // Common
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',

    // Auth
    'auth.title': 'Welcome to Qwiky',
    'auth.subtitle': 'Your Home Service Partner',
    'auth.mobileLabel': 'Mobile Number',
    'auth.mobilePlaceholder': '9876543210',
    'auth.invalidMobile': 'Please enter a valid mobile number',
    'auth.sendOtp': 'Send OTP',
    'auth.otpLabel': 'Enter OTP',
    'auth.otpPlaceholder': '1234',
    'auth.invalidOtp': 'Please enter a valid 4-digit OTP',
    'auth.verifyOtp': 'Verify OTP',
    'auth.resendOtp': 'Resend OTP',
    'auth.otpSent': 'OTP sent to',

    // Profile
    'profile.title': 'Profile',
    'profile.orderHistory': 'Order History',
    'profile.logout': 'Logout',

    // Booking
    'booking.selectLocation': 'Select Location',
    'booking.selectService': 'Choose Service',
    'booking.selectTimeSlot': 'Select Time Slot',
    'booking.bookingDetails': 'Booking Details',
    'booking.confirmBooking': 'Confirm Booking',
    'booking.chooseService': 'Choose Service',

    // Home
    'home.bookNow': 'Book Now',
    'home.referEarn': 'Refer & Earn',

    // Orders
    'orders.title': 'Orders',
    'orders.noOrders': 'No orders yet',
    'orders.orderHistory': 'Your order history will appear here',

    // Refer
    'refer.title': 'Refer & Earn',
    'refer.subtitle': 'Invite friends and earn rewards'
  };

  return texts[key] || key;
};