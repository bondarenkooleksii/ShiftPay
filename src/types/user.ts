export type UserRole = 'owner' | 'admin' | 'employee';

export interface UserProfile {
  initials: string;
  name: string;
  roleLabel: string;
  venueLabel?: string;
}
