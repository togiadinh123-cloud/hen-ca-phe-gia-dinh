export type UserRole = "user" | "admin";
export type GroupRole = "owner" | "admin" | "member";
export type MembershipStatus = "active" | "left" | "removed";
export type EventStatus = "draft" | "published" | "canceled" | "completed";
export type RegistrationStatus = "open" | "full" | "closed";
export type VenuePollStatus = "open" | "closed" | "locked";
export type ParticipantRole = "host" | "member";
export type ParticipantStatus =
  | "registered"
  | "traveling"
  | "checked_in"
  | "cancelled"
  | "no_show_pending"
  | "no_show_confirmed"
  | "removed";
export type VerificationMethod = "gps_qr" | "manual_review" | "admin_override";
export type VerificationStatus = "verified" | "pending_review" | "rejected";
export type CheckinSessionStatus = "active" | "expired" | "revoked";
export type AppealStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string;
  district: string | null;
  coffee_preferences: string[];
  role: UserRole;
  show_in_leaderboard: boolean;
  show_badges: boolean;
  created_at: string;
  updated_at: string;
}

export interface FriendGroup {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  created_by: string;
  visibility: "private";
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  membership_status: MembershipStatus;
  joined_at: string;
  left_at: string | null;
  removed_at: string | null;
  profile?: Profile;
}

export interface GroupInvitation {
  id: string;
  group_id: string;
  created_by: string;
  token_hash: string;
  invite_code: string;
  expires_at: string;
  max_uses: number;
  use_count: number;
  revoked_at: string | null;
  created_at: string;
}

export interface GroupMemberStats {
  id: string;
  group_id: string;
  user_id: string;
  reputation_score: number;
  xp_total: number;
  level: number;
  streak_count: number;
  last_qualified_event_at: string | null;
  updated_at: string;
  profile?: Profile;
}

export interface EventModel {
  id: string;
  group_id: string;
  host_id: string;
  title: string;
  description: string | null;
  city: string;
  district: string | null;
  area_label: string | null;
  starts_at: string;
  timezone: string;
  capacity: number;
  budget_min: number | null;
  budget_max: number | null;
  tags: string[];
  cover_image_url: string | null;
  event_status: EventStatus;
  registration_status: RegistrationStatus;
  poll_closes_at: string;
  cancellation_deadline: string;
  venue_poll_status: VenuePollStatus;
  selected_place_id: string | null;
  created_at: string;
  updated_at: string;
  host?: Profile;
  group?: FriendGroup;
  selected_place?: EventPlace;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role: ParticipantRole;
  participant_status: ParticipantStatus;
  joined_at: string;
  cancelled_at: string | null;
  checkin_id: string | null;
  location_sharing_enabled: boolean;
  last_location_at: string | null;
  profile?: Profile;
}

export interface EventPlace {
  id: string;
  event_id: string;
  proposed_by: string;
  google_place_id: string;
  place_name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  google_maps_uri: string | null;
  photo_reference: string | null;
  created_at: string;
  votes_count?: number;
  proposer?: Profile;
}

export interface EventVote {
  id: string;
  event_id: string;
  place_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LiveLocation {
  id: string;
  event_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy_m: number;
  heading: number | null;
  speed: number | null;
  updated_at: string;
  expires_at: string;
  profile?: Profile;
}

export interface CheckinSession {
  id: string;
  event_id: string;
  host_id: string;
  token_hash: string;
  nonce: string;
  issued_at: string;
  expires_at: string;
  revoked_at: string | null;
  host_latitude: number | null;
  host_longitude: number | null;
  status: CheckinSessionStatus;
}

export interface Checkin {
  id: string;
  event_id: string;
  user_id: string;
  participant_id: string;
  checkin_session_id: string | null;
  verification_method: VerificationMethod;
  checked_in_at: string;
  distance_to_venue_m: number | null;
  gps_accuracy_m: number | null;
  verification_status: VerificationStatus;
}

export interface ReputationTransaction {
  id: string;
  group_id: string;
  user_id: string;
  event_id: string | null;
  delta: number;
  reason_code: string;
  description: string;
  created_by: string;
  idempotency_key: string | null;
  created_at: string;
}

export interface XpTransaction {
  id: string;
  group_id: string;
  user_id: string;
  event_id: string | null;
  delta: number;
  reason_code: string;
  idempotency_key: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  criteria_config: Record<string, unknown>;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  group_id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  source_event_id: string | null;
  badge?: Badge;
}

export interface Appeal {
  id: string;
  group_id: string;
  event_id: string;
  user_id: string;
  reason: string;
  status: AppealStatus;
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  event?: EventModel;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  group_id: string | null;
  event_id: string | null;
  type: string;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}
