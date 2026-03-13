export type Role = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  timezone: string;
  address: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Availability {
  id: string;
  staffProfileId: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isException: boolean;
  exceptionDate?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Shift {
  id: string;
  locationId: string;
  location?: Location;
  startTime: string;
  endTime: string;
  requiredSkillId: string;
  requiredSkill?: Skill;
  headcountNeeded: number;
  isPublished: boolean;
  publishCutoffHours: number;
  isPremium: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignments?: ShiftAssignment[];
}

export type SwapType = 'SWAP' | 'DROP';

export type SwapStatus = 'PENDING' | 'TARGET_ACCEPTED' | 'MANAGER_APPROVED' | 'CANCELLED' | 'EXPIRED';

export interface SwapRequest {
  id: string;
  shiftId: string;
  shift?: Shift;
  requesterId: string;
  requester?: User;
  type: SwapType;
  targetStaffId?: string;
  targetStaff?: User;
  status: SwapStatus;
  targetAcceptedAt?: string;
  managerApprovedAt?: string;
  managerApprovedBy?: string;
  cancelledAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  shift?: Shift;
  staffId: string;
  staff?: User;
  assignedAt: string;
  assignedBy: string;
}

export interface StaffProfile {
  id: string;
  userId: string;
  user?: User;
  desiredWeeklyHours: number;
  skills?: Skill[];
  certifiedLocations?: Location[];
  availabilities?: Availability[];
}

export type NotificationType = 
  | 'SHIFT_ASSIGNED'
  | 'SHIFT_CHANGED'
  | 'SHIFT_REMOVED'
  | 'SCHEDULE_PUBLISHED'
  | 'SWAP_REQUESTED'
  | 'SWAP_ACCEPTED'
  | 'SWAP_APPROVED'
  | 'SWAP_CANCELLED'
  | 'OVERTIME_WARNING'
  | 'AVAILABILITY_CONFLICT';

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  shiftId?: string;
  shift?: Shift;
  userId: string;
  user?: User;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: any;
  afterState?: any;
  timestamp: string;
}
