# Payout System Testing Guide

## Prerequisites
1. Stripe account in test mode
2. Test API keys configured
3. Webhook endpoint configured in Stripe Dashboard
4. Creator account in the system

## Test Scenarios

### 1. Connect Account Creation
```bash
# Test creating a connect account
curl -X POST http://localhost:5000/api/v1/payouts/create-connect-account \
  -H "Authorization: Bearer <creator_jwt_token>" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": true,
  "statusCode": 201,
  "message": "Connect account created successfully!",
  "data": {
    "accountId": "acct_...",
    "onboardingUrl": "https://connect.stripe.com/setup/...",
    "accountStatus": "pending",
    "payoutsEnabled": false,
    "chargesEnabled": false
  }
}
```

### 2. Get Onboarding Link
```bash
# Test getting onboarding link for incomplete account
curl -X GET http://localhost:5000/api/v1/payouts/onboarding-link \
  -H "Authorization: Bearer <creator_jwt_token>"

# Expected Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Onboarding link generated successfully!",
  "data": {
    "onboardingUrl": "https://connect.stripe.com/setup/..."
  }
}
```

### 3. Get Account Information
```bash
# Test getting connected account info
curl -X GET http://localhost:5000/api/v1/payouts/account-info \
  -H "Authorization: Bearer <creator_jwt_token>"

# Expected Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Account information retrieved successfully!",
  "data": {
    "accountId": "acct_...",
    "email": "creator@example.com",
    "country": "US",
    "defaultCurrency": "usd",
    "payoutsEnabled": true,
    "chargesEnabled": true,
    "accountStatus": "active",
    "externalAccounts": [
      {
        "id": "ba_...",
        "object": "bank_account",
        "bank_name": "STRIPE TEST BANK",
        "last4": "6789",
        "routing_number": "110000000",
        "account_holder_type": "individual"
      }
    ]
  }
}
```

### 4. Get Creator Earnings
```bash
# Test getting creator earnings
curl -X GET http://localhost:5000/api/v1/payouts/earnings \
  -H "Authorization: Bearer <creator_jwt_token>"

# Expected Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Earnings retrieved successfully!",
  "data": {
    "totalEarnings": 150.00,
    "totalPayouts": 50.00,
    "pendingPayouts": 0.00,
    "availableBalance": 100.00,
    "currency": "usd"
  }
}
```

### 5. Request Payout
```bash
# Test requesting a payout
curl -X POST http://localhost:5000/api/v1/payouts/request \
  -H "Authorization: Bearer <creator_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "currency": "usd",
    "description": "Monthly earnings payout"
  }'

# Expected Response:
{
  "success": true,
  "statusCode": 201,
  "message": "Payout requested successfully!",
  "data": {
    "payoutId": "64f...",
    "stripePayoutId": "po_...",
    "amount": 50.00,
    "currency": "usd",
    "status": "pending",
    "estimatedArrival": 1234567890
  }
}
```

### 6. Get Payout History
```bash
# Test getting payout history
curl -X GET http://localhost:5000/api/v1/payouts/history \
  -H "Authorization: Bearer <creator_jwt_token>"

# Expected Response:
{
  "success": true,
  "statusCode": 200,
  "message": "Payout history retrieved successfully!",
  "data": [
    {
      "_id": "64f...",
      "amount": 50.00,
      "stripePayoutId": "po_...",
      "status": "paid",
      "currency": "usd",
      "description": "Monthly earnings payout",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

## Error Test Cases

### 1. Insufficient Balance
```bash
# Test payout with amount exceeding balance
curl -X POST http://localhost:5000/api/v1/payouts/request \
  -H "Authorization: Bearer <creator_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00
  }'

# Expected Response:
{
  "success": false,
  "statusCode": 400,
  "message": "Insufficient balance for payout"
}
```

### 2. Account Not Ready
```bash
# Test payout with incomplete onboarding
curl -X POST http://localhost:5000/api/v1/payouts/request \
  -H "Authorization: Bearer <incomplete_account_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00
  }'

# Expected Response:
{
  "success": false,
  "statusCode": 400,
  "message": "Please complete Stripe Connect onboarding first"
}
```

### 3. Invalid Amount
```bash
# Test payout with amount below minimum
curl -X POST http://localhost:5000/api/v1/payouts/request \
  -H "Authorization: Bearer <creator_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 0.50
  }'

# Expected Response:
{
  "success": false,
  "statusCode": 400,
  "message": "Minimum payout amount is $1"
}
```

### 4. Non-Creator Access
```bash
# Test with regular user token
curl -X POST http://localhost:5000/api/v1/payouts/create-connect-account \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "success": false,
  "statusCode": 403,
  "message": "Only creators can create connect accounts"
}
```

## Webhook Testing

Use Stripe CLI to test webhooks:

```bash
# Install Stripe CLI
# stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# Trigger test events
stripe trigger account.updated
stripe trigger payout.paid
stripe trigger payout.failed
```

## Database Verification

After running tests, verify data in MongoDB:

```javascript
// Check user updates
db.users.findOne({email: "creator@example.com"}, {
  stripeConnectAccountId: 1,
  stripeConnectAccountStatus: 1,
  stripeOnboardingCompleted: 1,
  payoutsEnabled: 1,
  chargesEnabled: 1
})

// Check payout records
db.payouts.find({}).sort({createdAt: -1})

// Check payment records for earnings calculation
db.payments.find({paymentStatus: "PAID"})
```

## Performance Testing

```bash
# Test concurrent payout requests
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/payouts/request \
    -H "Authorization: Bearer <creator_jwt_token>" \
    -H "Content-Type: application/json" \
    -d '{"amount": 1.00}' &
done
wait
```

## Monitoring

1. **Application Logs**: Check for webhook processing errors
2. **Stripe Dashboard**: Monitor Connect accounts and payouts
3. **Database**: Verify data consistency
4. **Response Times**: Ensure API performance