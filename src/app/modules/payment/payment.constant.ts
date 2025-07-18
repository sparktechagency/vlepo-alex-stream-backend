export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
  } as const;


export const paymentFilterableFields = [
  'searchTerm',
  'paymentStatus'
]

export const paymentSearchableFields = [
  'paymentMethod',
  'eventName'
]