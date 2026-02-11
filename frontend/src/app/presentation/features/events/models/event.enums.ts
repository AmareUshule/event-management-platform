// event.enums.ts

  enum EventType {
  PHYSICAL = 'physical',
  VIRTUAL = 'virtual'
}

  enum EventStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}
export { EventType, EventStatus };