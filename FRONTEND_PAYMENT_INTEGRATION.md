# Frontend Payment System Integration Guide

This guide provides comprehensive documentation for integrating the payment and payout systems into your frontend application.

## Table of Contents
- [Authentication](#authentication)
- [Payment System](#payment-system)
- [Payout System (Creator Features)](#payout-system-creator-features)
- [Error Handling](#error-handling)
- [TypeScript Interfaces](#typescript-interfaces)
- [Example Implementation](#example-implementation)

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```javascript
const headers = {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
};
```

**Base URL**: `http://localhost:5000/api/v1`

## Payment System

### 1. Create Payment Intent

**Endpoint**: `POST /payments/create-payment-intent`

**Auth Required**: USER role

**Request Body**:
```typescript
{
  eventId: string; // Valid MongoDB ObjectId
}
```

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Payment intent created!",
  data: {
    url: string; // Stripe Checkout URL
  }
}
```

**Frontend Implementation**:
```javascript
const createPaymentIntent = async (eventId) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect user to Stripe Checkout
      window.location.href = data.data.url;
    }
  } catch (error) {
    console.error('Payment intent creation failed:', error);
  }
};
```

### 2. Verify Payment

**Endpoint**: `POST /payments/verify-payment`

**Auth Required**: USER role

**Request Body**:
```typescript
{
  paymentIntentId: string;
}
```

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Payment verified!",
  data: {
    payment: PaymentObject,
    ticket: TicketObject
  }
}
```

**Frontend Implementation**:
```javascript
const verifyPayment = async (paymentIntentId) => {
  try {
    const response = await fetch(`${BASE_URL}/payments/verify-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ paymentIntentId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Payment successful - show success message
      // Redirect to ticket page or event details
      return data.data;
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
  }
};
```

### 3. Get Transaction History

**Endpoint**: `GET /payments/get-transaction-history`

**Auth Required**: USER or CREATOR role

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Transaction history retrieved!",
  data: [
    {
      transactionId: string,
      amount: number,
      createdAt: string,
      eventName: string,
      userName: string,
      profileImage: string,
      creatorName?: string,
      creatorPhoto?: string
    }
  ]
}
```

**Frontend Implementation**:
```javascript
const getTransactionHistory = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payments/get-transaction-history`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch transaction history:', error);
  }
};
```

## Payout System (Creator Features)

### 1. Create Stripe Connect Account

**Endpoint**: `POST /payouts/create-connect-account`

**Auth Required**: CREATOR role

**Request Body**: None

**Response**:
```typescript
{
  success: true,
  statusCode: 201,
  message: "Connect account created successfully!",
  data: {
    accountId: string,
    onboardingUrl?: string,
    accountStatus: 'pending' | 'active' | 'restricted' | 'inactive',
    payoutsEnabled: boolean,
    chargesEnabled: boolean
  }
}
```

**Frontend Implementation**:
```javascript
const createConnectAccount = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payouts/create-connect-account`, {
      method: 'POST',
      headers
    });
    
    const data = await response.json();
    
    if (data.success && data.data.onboardingUrl) {
      // Redirect to Stripe onboarding
      window.location.href = data.data.onboardingUrl;
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to create connect account:', error);
  }
};
```

### 2. Get Onboarding Link

**Endpoint**: `GET /payouts/onboarding-link`

**Auth Required**: CREATOR role

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Onboarding link generated successfully!",
  data: {
    onboardingUrl: string
  }
}
```

### 3. Get Connected Account Information

**Endpoint**: `GET /payouts/account-info`

**Auth Required**: CREATOR role

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Account information retrieved successfully!",
  data: {
    accountId: string,
    email: string,
    country: string,
    defaultCurrency: string,
    payoutsEnabled: boolean,
    chargesEnabled: boolean,
    accountStatus: string,
    externalAccounts: [
      {
        id: string,
        object: string,
        bank_name?: string,
        last4: string,
        routing_number?: string,
        account_holder_type?: string
      }
    ]
  }
}
```

### 4. Get Creator Earnings

**Endpoint**: `GET /payouts/earnings`

**Auth Required**: CREATOR role

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Earnings retrieved successfully!",
  data: {
    totalEarnings: number,     // 50% of all ticket sales
    totalPayouts: number,      // Total amount already paid out
    pendingPayouts: number,    // Amount in pending payouts
    availableBalance: number   // Available for withdrawal
  }
}
```

**Frontend Implementation**:
```javascript
const getCreatorEarnings = async () => {
  try {
    const response = await fetch(`${BASE_URL}/payouts/earnings`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch earnings:', error);
  }
};
```

### 5. Request Payout

**Endpoint**: `POST /payouts/request`

**Auth Required**: CREATOR role

**Request Body**:
```typescript
{
  amount: number,        // Between $1 and $10,000
  currency?: string,     // Defaults to 'usd'
  description?: string   // Max 200 characters
}
```

**Response**:
```typescript
{
  success: true,
  statusCode: 201,
  message: "Payout requested successfully!",
  data: {
    payoutId: string,
    amount: number,
    currency: string,
    status: 'pending',
    estimatedArrival: string
  }
}
```

**Frontend Implementation**:
```javascript
const requestPayout = async (amount, description = '') => {
  try {
    const response = await fetch(`${BASE_URL}/payouts/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount,
        currency: 'usd',
        description
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      // Refresh earnings and payout history
      return data.data;
    }
  } catch (error) {
    console.error('Payout request failed:', error);
  }
};
```

### 6. Get Payout History

**Endpoint**: `GET /payouts/history`

**Auth Required**: CREATOR role

**Response**:
```typescript
{
  success: true,
  statusCode: 200,
  message: "Payout history retrieved successfully!",
  data: [
    {
      _id: string,
      amount: number,
      currency: string,
      status: 'pending' | 'paid' | 'failed' | 'canceled',
      description?: string,
      failureReason?: string,
      createdAt: string,
      updatedAt: string
    }
  ]
}
```

## Error Handling

### Common Error Responses

```typescript
{
  success: false,
  statusCode: number,
  message: string,
  errorMessages?: [
    {
      path: string,
      message: string
    }
  ]
}
```

### Error Status Codes

- **400**: Bad Request (validation errors, insufficient balance)
- **401**: Unauthorized (invalid or missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Frontend Error Handling

```javascript
const handleApiError = (error, response) => {
  if (response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (response?.status === 403) {
    // Show permission denied message
    showError('You do not have permission to perform this action');
  } else if (response?.status === 400) {
    // Show validation errors
    const errorData = response.data;
    if (errorData.errorMessages) {
      errorData.errorMessages.forEach(err => {
        showError(`${err.path}: ${err.message}`);
      });
    } else {
      showError(errorData.message);
    }
  } else {
    // Generic error
    showError('An unexpected error occurred. Please try again.');
  }
};
```

## TypeScript Interfaces

```typescript
// Payment Interfaces
interface PaymentIntent {
  eventId: string;
}

interface PaymentVerification {
  paymentIntentId: string;
}

interface Transaction {
  transactionId: string;
  amount: number;
  createdAt: string;
  eventName: string;
  userName: string;
  profileImage: string;
  creatorName?: string;
  creatorPhoto?: string;
}

// Payout Interfaces
interface PayoutRequest {
  amount: number;
  currency?: string;
  description?: string;
}

interface CreatorEarnings {
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
  availableBalance: number;
}

interface PayoutHistory {
  _id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  description?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ConnectAccount {
  accountId: string;
  email: string;
  country: string;
  defaultCurrency: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  accountStatus: string;
  externalAccounts: BankAccount[];
}

interface BankAccount {
  id: string;
  object: string;
  bank_name?: string;
  last4: string;
  routing_number?: string;
  account_holder_type?: string;
}
```

## Example Implementation

### React Hook for Payment Management

```javascript
import { useState, useEffect } from 'react';

const usePaymentSystem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createPayment = async (eventId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.data.url;
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Payment creation failed');
    } finally {
      setLoading(false);
    }
  };
  
  return { createPayment, loading, error };
};
```

### React Hook for Creator Payouts

```javascript
const useCreatorPayouts = () => {
  const [earnings, setEarnings] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchEarnings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/payouts/earnings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setEarnings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };
  
  const requestPayout = async (amount, description) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/payouts/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, description })
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh earnings and history
        await fetchEarnings();
        await fetchPayoutHistory();
        return data.data;
      }
    } catch (error) {
      console.error('Payout request failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPayoutHistory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/payouts/history`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setPayoutHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payout history:', error);
    }
  };
  
  useEffect(() => {
    fetchEarnings();
    fetchPayoutHistory();
  }, []);
  
  return {
    earnings,
    payoutHistory,
    loading,
    requestPayout,
    fetchEarnings,
    fetchPayoutHistory
  };
};
```

## Important Notes

1. **Role-based Access**: Ensure users have the correct roles before showing payment/payout features
2. **Error Handling**: Always implement proper error handling for network requests
3. **Loading States**: Show loading indicators during API calls
4. **Validation**: Validate form inputs on the frontend before sending requests
5. **Security**: Never store sensitive payment information in frontend state
6. **Webhooks**: Payment status updates are handled via webhooks, so implement real-time updates if needed
7. **Testing**: Use Stripe's test mode for development and testing

## Support

For integration issues:
- Check browser console for detailed error messages
- Verify authentication tokens are valid
- Ensure user roles match endpoint requirements
- Test with Stripe's test data in development mode