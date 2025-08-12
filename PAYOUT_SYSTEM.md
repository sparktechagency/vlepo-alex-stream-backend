# Creator Payout System Documentation

## Overview
This system implements Stripe Connect functionality to allow creators to withdraw their earnings from ticket sales. Creators receive 50% of all ticket sales from their events.

## Features

### 1. Stripe Connect Account Management
- **Create Connect Account**: Minimal onboarding for creators
- **Account Onboarding**: Streamlined process without requiring website details
- **Account Status Tracking**: Real-time updates via webhooks
- **Account Information**: View connected bank account details

### 2. Earnings Management
- **Automatic Calculation**: 50% of ticket sales automatically allocated to creators
- **Real-time Balance**: View available balance, total earnings, and payout history
- **Minimum Payout**: $1 minimum withdrawal amount
- **Maximum Payout**: $10,000 maximum per transaction

### 3. Payout Processing
- **Instant Payouts**: Fast transfers to creator bank accounts
- **Payout History**: Complete transaction history with status tracking
- **Webhook Integration**: Real-time status updates for all payout events

## API Endpoints

### Connect Account Management
```
POST /api/v1/payouts/create-connect-account
- Creates a new Stripe Connect account for the creator
- Auth: Creator role required
- Returns: Account ID and onboarding URL

GET /api/v1/payouts/onboarding-link
- Generates a new onboarding link for incomplete accounts
- Auth: Creator role required
- Returns: Onboarding URL

GET /api/v1/payouts/account-info
- Retrieves connected account information and bank details
- Auth: Creator role required
- Returns: Account status, bank account info, capabilities
```

### Earnings and Payouts
```
GET /api/v1/payouts/earnings
- Calculates and returns creator earnings summary
- Auth: Creator role required
- Returns: Total earnings, available balance, payout history

POST /api/v1/payouts/request
- Requests a payout to the creator's bank account
- Auth: Creator role required
- Body: { amount: number, currency?: string, description?: string }
- Returns: Payout details and estimated arrival

GET /api/v1/payouts/history
- Retrieves complete payout history for the creator
- Auth: Creator role required
- Returns: Array of payout records with status
```

## Database Schema

### User Model Updates
```typescript
// Added to existing User schema
stripeConnectAccountId?: string;
stripeConnectAccountStatus?: 'pending' | 'active' | 'restricted' | 'inactive';
stripeOnboardingCompleted?: boolean;
payoutsEnabled?: boolean;
chargesEnabled?: boolean;
```

### Payout Model
```typescript
interface IPayout {
  creatorId: ObjectId;
  amount: number;
  stripePayoutId: string;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  currency: string;
  description?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Webhook Events

The system handles the following Stripe webhook events:

### Account Events
- `account.updated`: Updates creator account status and capabilities

### Payout Events
- `payout.paid`: Marks payout as completed
- `payout.failed`: Marks payout as failed with reason
- `payout.canceled`: Marks payout as canceled

## Security Features

1. **Role-based Access**: Only creators can access payout functionality
2. **Account Verification**: Payouts only allowed for verified accounts
3. **Balance Validation**: Prevents overdrafts and invalid amounts
4. **Webhook Verification**: All webhooks verified using Stripe signatures
5. **Transaction Logging**: Complete audit trail for all payout activities

## Error Handling

- **Insufficient Balance**: Prevents payouts exceeding available earnings
- **Account Not Ready**: Blocks payouts for incomplete onboarding
- **Invalid Amounts**: Validates minimum/maximum payout limits
- **Stripe Errors**: Graceful handling of Stripe API failures
- **Webhook Failures**: Robust error handling for webhook processing

## Environment Variables

Ensure these are configured in your `.env` file:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

## Usage Flow

1. **Creator Onboarding**:
   - Creator calls `POST /payouts/create-connect-account`
   - System creates Stripe Connect account
   - Creator completes onboarding via returned URL
   - Webhook updates account status automatically

2. **Earning Money**:
   - Users purchase tickets for creator's events
   - 50% of ticket price automatically allocated to creator
   - Earnings tracked in real-time

3. **Requesting Payouts**:
   - Creator checks balance via `GET /payouts/earnings`
   - Creator requests payout via `POST /payouts/request`
   - System processes payout through Stripe
   - Webhook updates payout status

4. **Monitoring**:
   - Creator views payout history via `GET /payouts/history`
   - Creator checks account info via `GET /payouts/account-info`

## Testing

For testing, use Stripe's test mode:
1. Use test API keys
2. Use Stripe CLI for webhook testing: `stripe listen --forward-to localhost:5000/api/stripe/webhook`
3. Test with Stripe's test bank account numbers
4. Monitor webhook events in Stripe Dashboard

## Support

For issues related to:
- **Stripe Integration**: Check Stripe Dashboard and logs
- **Webhook Processing**: Monitor application logs for webhook errors
- **Payout Failures**: Check Stripe Connect account status and requirements