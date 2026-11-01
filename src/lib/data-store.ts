import {
  Profile,
  FriendGroup,
  GroupMember,
  GroupMemberStats,
  EventModel,
  EventParticipant,
  EventPlace,
  EventVote,
  LiveLocation,
  CheckinSession,
  Checkin,
  ReputationTransaction,
  XpTransaction,
  Badge,
  UserBadge,
  Appeal,
  NotificationItem,
} from "@/types/database";
import { generateSignedQrToken } from "@/lib/qr-security";

// Initial Demo/Development Seed Data
export const INITIAL_PROFILES: Profile[] = [
  {
    id: "user_dinh",
    username: "dinhnguyen",
    display_name: "Định Nguyễn",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    bio: "Mê Cold Brew và không gian yên tĩnh đọc sách.",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    coffee_preferences: ["Cold Brew", "Espresso", "Pour Over"],
    role: "user",
    show_in_leaderboard: true,
    show_badges: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_mai",
    username: "maitran",
    display_name: "Mai Trần",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    bio: "Thích cà phê sữa đá vỉa hè và acoustic cuối tuần.",
    city: "Hồ Chí Minh",
    district: "Bình Thạnh",
    coffee_preferences: ["Bạc xỉu", "Cà phê sữa đá"],
    role: "user",
    show_in_leaderboard: true,
    show_badges: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_nam",
    username: "namle",
    display_name: "Nam Lê",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    bio: "Luôn đúng giờ, người giữ lời trong mọi cuộc hẹn.",
    city: "Hồ Chí Minh",
    district: "Quận 3",
    coffee_preferences: ["Cappuccino", "Matcha Latte"],
    role: "user",
    show_in_leaderboard: true,
    show_badges: true,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_tuan",
    username: "tuanpham",
    display_name: "Tuấn Phạm",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    bio: "Đang cố gắng cai biệt danh Chúa tể bùng kèo...",
    city: "Hồ Chí Minh",
    district: "Quận 7",
    coffee_preferences: ["Americano đá"],
    role: "user",
    show_in_leaderboard: true,
    show_badges: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user_admin",
    username: "admin",
    display_name: "Quản Trị Viên",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    bio: "Admin hệ thống kiểm duyệt và xử lý khiếu nại.",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    coffee_preferences: [],
    role: "admin",
    show_in_leaderboard: false,
    show_badges: false,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_GROUPS: FriendGroup[] = [
  {
    id: "group_weekend_buddies",
    name: "Hội Bạn Cà Phê Cuối Tuần",
    description: "Nhóm riêng tụi mình hẹn hò cà phê, tán gẫu sáng thứ 7 và CN.",
    avatar_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300",
    cover_url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000",
    created_by: "user_dinh",
    visibility: "private",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "group_dev_saigon",
    name: "Team Dev Sài Gòn",
    description: "Kèo cà phê brainstorm công nghệ, pair-programming và review code.",
    avatar_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300",
    cover_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000",
    created_by: "user_dinh",
    visibility: "private",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_GROUP_MEMBERS: GroupMember[] = [
  {
    id: "gm_1",
    group_id: "group_weekend_buddies",
    user_id: "user_dinh",
    role: "owner",
    membership_status: "active",
    joined_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
  {
    id: "gm_2",
    group_id: "group_weekend_buddies",
    user_id: "user_mai",
    role: "admin",
    membership_status: "active",
    joined_at: new Date(Date.now() - 19 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
  {
    id: "gm_3",
    group_id: "group_weekend_buddies",
    user_id: "user_nam",
    role: "member",
    membership_status: "active",
    joined_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
  {
    id: "gm_4",
    group_id: "group_weekend_buddies",
    user_id: "user_tuan",
    role: "member",
    membership_status: "active",
    joined_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
  {
    id: "gm_5",
    group_id: "group_dev_saigon",
    user_id: "user_dinh",
    role: "owner",
    membership_status: "active",
    joined_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
  {
    id: "gm_6",
    group_id: "group_dev_saigon",
    user_id: "user_nam",
    role: "member",
    membership_status: "active",
    joined_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    left_at: null,
    removed_at: null,
  },
];

export const INITIAL_STATS: GroupMemberStats[] = [
  {
    id: "stat_1",
    group_id: "group_weekend_buddies",
    user_id: "user_dinh",
    reputation_score: 112,
    xp_total: 180,
    level: 3,
    streak_count: 4,
    last_qualified_event_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "stat_2",
    group_id: "group_weekend_buddies",
    user_id: "user_mai",
    reputation_score: 106,
    xp_total: 95,
    level: 2,
    streak_count: 2,
    last_qualified_event_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "stat_3",
    group_id: "group_weekend_buddies",
    user_id: "user_nam",
    reputation_score: 115,
    xp_total: 210,
    level: 3,
    streak_count: 5,
    last_qualified_event_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "stat_4",
    group_id: "group_weekend_buddies",
    user_id: "user_tuan",
    reputation_score: 55, // Bị trừ do no-show 3 lần
    xp_total: 40,
    level: 1,
    streak_count: 0,
    last_qualified_event_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: "stat_5",
    group_id: "group_dev_saigon",
    user_id: "user_dinh",
    reputation_score: 100,
    xp_total: 30,
    level: 1,
    streak_count: 1,
    last_qualified_event_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge_on_time",
    code: "on_time",
    name: "Đúng giờ",
    description: "Check-in QR và GPS hợp lệ, đúng giờ hẹn trong nhiều buổi cà phê.",
    icon: "ClockCheck",
    criteria_config: { type: "on_time_count", threshold: 3 },
    is_active: true,
  },
  {
    id: "badge_promise_keeper",
    code: "promise_keeper",
    name: "Người giữ lời",
    description: "Hoàn thành liên tục các kèo cà phê đã đăng ký mà không hủy trễ hay bùng kèo.",
    icon: "ShieldCheck",
    criteria_config: { type: "consecutive_clean_events", threshold: 5 },
    is_active: true,
  },
  {
    id: "badge_coffee_buddy",
    code: "coffee_buddy",
    name: "Cạ cứng cà phê",
    description: "Thành viên năng nổ tham gia nhiều buổi cà phê cùng nhóm bạn.",
    icon: "Coffee",
    criteria_config: { type: "attended_events_count", threshold: 5 },
    is_active: true,
  },
  {
    id: "badge_flake_king",
    code: "flake_king",
    name: "Chúa tể bùng kèo",
    description: "Huy hiệu nhắc nhở vui khi có từ 3 lần xác nhận không đến mà không có lý do chính đáng.",
    icon: "Ghost",
    criteria_config: { type: "no_show_confirmed_count", threshold: 3 },
    is_active: true,
  },
];

export const INITIAL_USER_BADGES: UserBadge[] = [
  {
    id: "ub_1",
    group_id: "group_weekend_buddies",
    user_id: "user_nam",
    badge_id: "badge_on_time",
    earned_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: "ub_2",
    group_id: "group_weekend_buddies",
    user_id: "user_nam",
    badge_id: "badge_promise_keeper",
    earned_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: "ub_3",
    group_id: "group_weekend_buddies",
    user_id: "user_dinh",
    badge_id: "badge_coffee_buddy",
    earned_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    source_event_id: null,
  },
  {
    id: "ub_4",
    group_id: "group_weekend_buddies",
    user_id: "user_tuan",
    badge_id: "badge_flake_king", // Đã dính huy hiệu vui Chúa tể bùng kèo
    earned_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    source_event_id: null,
  },
];

// Event 1: Currently active with locked venue, location sharing on!
export const INITIAL_EVENTS: EventModel[] = [
  {
    id: "event_1",
    group_id: "group_weekend_buddies",
    host_id: "user_dinh",
    title: "Cà phê sáng Chủ Nhật tán gẫu & board game",
    description: "Tụi mình hẹn nhau làm ly cold brew, tán gẫu chuyện tuần qua và chơi Uno nha các bạn!",
    city: "Hồ Chí Minh",
    district: "Quận 1",
    area_label: "Trung tâm Quận 1",
    starts_at: new Date(Date.now() + 45 * 60000).toISOString(), // 45 phút nữa bắt đầu!
    timezone: "Asia/Ho_Chi_Minh",
    capacity: 6,
    budget_min: 45000,
    budget_max: 95000,
    tags: ["chill", "board game", "cuối tuần"],
    cover_image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    event_status: "published",
    registration_status: "open",
    poll_closes_at: new Date(Date.now() - 30 * 60000).toISOString(), // Đã chốt poll
    cancellation_deadline: new Date(Date.now() + 15 * 60000).toISOString(),
    venue_poll_status: "closed",
    selected_place_id: "place_workshop",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "event_2",
    group_id: "group_weekend_buddies",
    host_id: "user_mai",
    title: "Kèo acoustic tối thứ Tư",
    description: "Nghe nhạc nhẹ nhàng xả stress giữa tuần. Mọi người vote quán bên dưới nhé!",
    city: "Hồ Chí Minh",
    district: "Bình Thạnh",
    area_label: "Phường 19, Bình Thạnh",
    starts_at: new Date(Date.now() + 3 * 86400000).toISOString(),
    timezone: "Asia/Ho_Chi_Minh",
    capacity: 5,
    budget_min: 50000,
    budget_max: 120000,
    tags: ["acoustic", "chill", "tối thứ 4"],
    cover_image_url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
    event_status: "published",
    registration_status: "open",
    poll_closes_at: new Date(Date.now() + 2 * 86400000).toISOString(), // Đang mở bình chọn
    cancellation_deadline: new Date(Date.now() + 2.5 * 86400000).toISOString(),
    venue_poll_status: "open",
    selected_place_id: null,
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_EVENT_PARTICIPANTS: EventParticipant[] = [
  {
    id: "part_1",
    event_id: "event_1",
    user_id: "user_dinh",
    role: "host",
    participant_status: "traveling",
    joined_at: new Date(Date.now() - 86400000).toISOString(),
    cancelled_at: null,
    checkin_id: null,
    location_sharing_enabled: true,
    last_location_at: new Date().toISOString(),
  },
  {
    id: "part_2",
    event_id: "event_1",
    user_id: "user_nam",
    role: "member",
    participant_status: "traveling",
    joined_at: new Date(Date.now() - 50000000).toISOString(),
    cancelled_at: null,
    checkin_id: null,
    location_sharing_enabled: true,
    last_location_at: new Date().toISOString(),
  },
  {
    id: "part_3",
    event_id: "event_1",
    user_id: "user_mai",
    role: "member",
    participant_status: "registered",
    joined_at: new Date(Date.now() - 40000000).toISOString(),
    cancelled_at: null,
    checkin_id: null,
    location_sharing_enabled: false,
    last_location_at: null,
  },
  // Event 2 participants
  {
    id: "part_4",
    event_id: "event_2",
    user_id: "user_mai",
    role: "host",
    participant_status: "registered",
    joined_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    cancelled_at: null,
    checkin_id: null,
    location_sharing_enabled: false,
    last_location_at: null,
  },
  {
    id: "part_5",
    event_id: "event_2",
    user_id: "user_dinh",
    role: "member",
    participant_status: "registered",
    joined_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    cancelled_at: null,
    checkin_id: null,
    location_sharing_enabled: false,
    last_location_at: null,
  },
];

export const INITIAL_EVENT_PLACES: EventPlace[] = [
  {
    id: "place_workshop",
    event_id: "event_1",
    proposed_by: "user_dinh",
    google_place_id: "ChIJb_f1aW4pdTERo9_k2kYx02E",
    place_name: "The Workshop Coffee",
    formatted_address: "27 Ngô Đức Kế, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.774342,
    longitude: 106.704834,
    google_maps_uri: "https://maps.google.com/?cid=1111111111",
    photo_reference: null,
    created_at: new Date(Date.now() - 80000000).toISOString(),
  },
  {
    id: "place_laviet",
    event_id: "event_1",
    proposed_by: "user_nam",
    google_place_id: "ChIJN1tT_rWvdTER9-KXZ7X3X4s",
    place_name: "Là Việt Coffee Saigon",
    formatted_address: "191 Hai Bà Trưng, Phường 6, Quận 3, TP. Hồ Chí Minh",
    latitude: 10.785215,
    longitude: 106.696123,
    google_maps_uri: "https://maps.google.com/?cid=2222222222",
    photo_reference: null,
    created_at: new Date(Date.now() - 75000000).toISOString(),
  },
  // Event 2 places
  {
    id: "place_okkio",
    event_id: "event_2",
    proposed_by: "user_mai",
    google_place_id: "ChIJ_3Lp0wopdTER_abc123456",
    place_name: "Okkio Caffe",
    formatted_address: "120-122 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    latitude: 10.77254,
    longitude: 106.69921,
    google_maps_uri: "https://maps.google.com/?cid=3333333333",
    photo_reference: null,
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "place_cheesecoffee",
    event_id: "event_2",
    proposed_by: "user_dinh",
    google_place_id: "ChIJ_4Lp0wopdTER_def789012",
    place_name: "Cheese Coffee D2",
    formatted_address: "Số 6 Đường D2, Phường 25, Bình Thạnh, TP. Hồ Chí Minh",
    latitude: 10.80231,
    longitude: 106.71342,
    google_maps_uri: "https://maps.google.com/?cid=4444444444",
    photo_reference: null,
    created_at: new Date(Date.now() - 7 * 3600000).toISOString(),
  },
];

export const INITIAL_EVENT_VOTES: EventVote[] = [
  {
    id: "vote_1",
    event_id: "event_1",
    place_id: "place_workshop",
    user_id: "user_dinh",
    created_at: new Date(Date.now() - 70000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "vote_2",
    event_id: "event_1",
    place_id: "place_workshop",
    user_id: "user_nam",
    created_at: new Date(Date.now() - 65000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "vote_3",
    event_id: "event_1",
    place_id: "place_laviet",
    user_id: "user_mai",
    created_at: new Date(Date.now() - 60000000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Event 2 votes
  {
    id: "vote_4",
    event_id: "event_2",
    place_id: "place_okkio",
    user_id: "user_mai",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Live locations for Event 1 (simulating user_dinh and user_nam heading to The Workshop Coffee)
export const INITIAL_LIVE_LOCATIONS: LiveLocation[] = [
  {
    id: "loc_dinh",
    event_id: "event_1",
    user_id: "user_dinh",
    latitude: 10.77612, // Cách The Workshop ~250m
    longitude: 106.70295,
    accuracy_m: 12,
    heading: 135,
    speed: 4.2, // ~15 km/h xe máy
    updated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString(),
  },
  {
    id: "loc_nam",
    event_id: "event_1",
    user_id: "user_nam",
    latitude: 10.7812, // Cách The Workshop ~850m
    longitude: 106.6998,
    accuracy_m: 8,
    heading: 160,
    speed: 6.5,
    updated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 300000).toISOString(),
  },
];

// In-Memory Data Store with transaction helpers
class HenCaPheDataStore {
  profiles: Profile[] = [...INITIAL_PROFILES];
  groups: FriendGroup[] = [...INITIAL_GROUPS];
  groupMembers: GroupMember[] = [...INITIAL_GROUP_MEMBERS];
  stats: GroupMemberStats[] = [...INITIAL_STATS];
  badges: Badge[] = [...INITIAL_BADGES];
  userBadges: UserBadge[] = [...INITIAL_USER_BADGES];
  events: EventModel[] = [...INITIAL_EVENTS];
  participants: EventParticipant[] = [...INITIAL_EVENT_PARTICIPANTS];
  places: EventPlace[] = [...INITIAL_EVENT_PLACES];
  votes: EventVote[] = [...INITIAL_EVENT_VOTES];
  liveLocations: LiveLocation[] = [...INITIAL_LIVE_LOCATIONS];
  checkinSessions: CheckinSession[] = [];
  checkins: Checkin[] = [];
  reputationTransactions: ReputationTransaction[] = [];
  xpTransactions: XpTransaction[] = [];
  appeals: Appeal[] = [];
  notifications: NotificationItem[] = [];

  // Active current user for development context
  currentUserId: string = "user_dinh";

  setCurrentUser(userId: string) {
    this.currentUserId = userId;
  }

  getCurrentUser(): Profile {
    return (
      this.profiles.find((p) => p.id === this.currentUserId) ||
      this.profiles[0]
    );
  }

  // Get user groups (User must be an active member)
  getUserGroups(userId: string): FriendGroup[] {
    const activeGroupIds = this.groupMembers
      .filter((m) => m.user_id === userId && m.membership_status === "active")
      .map((m) => m.group_id);

    return this.groups.filter((g) => activeGroupIds.includes(g.id));
  }

  // Get group details with membership check
  getGroupById(groupId: string, userId: string): { group: FriendGroup; membership: GroupMember } | null {
    const membership = this.groupMembers.find(
      (m) => m.group_id === groupId && m.user_id === userId && m.membership_status === "active"
    );
    if (!membership) return null;

    const group = this.groups.find((g) => g.id === groupId);
    if (!group) return null;

    return { group, membership };
  }

  // Get events in a group
  getGroupEvents(groupId: string, userId: string): EventModel[] {
    const isMember = this.groupMembers.some(
      (m) => m.group_id === groupId && m.user_id === userId && m.membership_status === "active"
    );
    if (!isMember) return [];

    return this.events
      .filter((e) => e.group_id === groupId)
      .map((e) => this.hydrateEvent(e));
  }

  // Hydrate an event with its host, selected place, participants
  hydrateEvent(event: EventModel): EventModel {
    const host = this.profiles.find((p) => p.id === event.host_id);
    const selectedPlace = this.places.find((p) => p.id === event.selected_place_id);
    const eventParticipants = this.participants
      .filter((p) => p.event_id === event.id && p.participant_status !== "cancelled")
      .map((p) => ({
        ...p,
        profile: this.profiles.find((pr) => pr.id === p.user_id),
      }));

    return {
      ...event,
      host,
      selected_place: selectedPlace,
      participants: eventParticipants,
    };
  }

  // Get event by ID with membership check
  getEventById(eventId: string, userId: string): EventModel | null {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return null;

    // Check if user is active member of event.group_id
    const isMember = this.groupMembers.some(
      (m) => m.group_id === event.group_id && m.user_id === userId && m.membership_status === "active"
    );
    if (!isMember) return null;

    return this.hydrateEvent(event);
  }

  // Create a new friend group
  createGroup(name: string, description: string, creatorId: string): FriendGroup {
    const newGroup: FriendGroup = {
      id: `group_${Date.now()}`,
      name,
      description,
      avatar_url: null,
      cover_url: null,
      created_by: creatorId,
      visibility: "private",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.groups.unshift(newGroup);

    // Creator is owner
    this.groupMembers.push({
      id: `gm_${Date.now()}`,
      group_id: newGroup.id,
      user_id: creatorId,
      role: "owner",
      membership_status: "active",
      joined_at: new Date().toISOString(),
      left_at: null,
      removed_at: null,
    });

    // Create initial stat row (100 reputation score)
    this.stats.push({
      id: `stat_${Date.now()}`,
      group_id: newGroup.id,
      user_id: creatorId,
      reputation_score: 100,
      xp_total: 0,
      level: 1,
      streak_count: 0,
      last_qualified_event_at: null,
      updated_at: new Date().toISOString(),
    });

    return newGroup;
  }

  // Create an invitation
  createInvitation(groupId: string, creatorId: string) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `inv_${Date.now()}_${inviteCode}`;
    return {
      token,
      inviteCode,
      url: `/invite/${token}`,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    };
  }

  // Accept an invitation
  acceptInvitation(tokenOrCode: string, userId: string): { success: boolean; groupId?: string; message: string } {
    // For demo purposes, any token starting with inv_ links to group_weekend_buddies or group_dev_saigon
    const targetGroup = this.groups[0];
    if (!targetGroup) return { success: false, message: "Nhóm không tồn tại" };

    const existing = this.groupMembers.find(
      (m) => m.group_id === targetGroup.id && m.user_id === userId
    );

    if (existing && existing.membership_status === "active") {
      return { success: true, groupId: targetGroup.id, message: "Bạn đã là thành viên của nhóm này" };
    }

    if (existing) {
      existing.membership_status = "active";
      existing.joined_at = new Date().toISOString();
    } else {
      this.groupMembers.push({
        id: `gm_${Date.now()}`,
        group_id: targetGroup.id,
        user_id: userId,
        role: "member",
        membership_status: "active",
        joined_at: new Date().toISOString(),
        left_at: null,
        removed_at: null,
      });

      this.stats.push({
        id: `stat_${Date.now()}`,
        group_id: targetGroup.id,
        user_id: userId,
        reputation_score: 100,
        xp_total: 0,
        level: 1,
        streak_count: 0,
        last_qualified_event_at: null,
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true, groupId: targetGroup.id, message: "Tham gia nhóm thành công!" };
  }

  // Create Event in Group (Host is automatically added as participant)
  createEvent(
    data: Omit<EventModel, "id" | "created_at" | "updated_at" | "selected_place_id" | "venue_poll_status" | "event_status" | "registration_status">
  ): EventModel {
    const newEvent: EventModel = {
      ...data,
      id: `event_${Date.now()}`,
      event_status: "published",
      registration_status: "open",
      venue_poll_status: "open",
      selected_place_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.events.unshift(newEvent);

    // Host automatically registered
    this.participants.push({
      id: `part_${Date.now()}`,
      event_id: newEvent.id,
      user_id: newEvent.host_id,
      role: "host",
      participant_status: "registered",
      joined_at: new Date().toISOString(),
      cancelled_at: null,
      checkin_id: null,
      location_sharing_enabled: false,
      last_location_at: null,
    });

    return this.hydrateEvent(newEvent);
  }

  // Join Event (Instant RSVP)
  joinEvent(eventId: string, userId: string): { success: boolean; message: string } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Kèo không tồn tại" };

    // Check membership
    const isMember = this.groupMembers.some(
      (m) => m.group_id === event.group_id && m.user_id === userId && m.membership_status === "active"
    );
    if (!isMember) return { success: false, message: "Bạn phải là thành viên của nhóm để tham gia kèo này" };

    // Check capacity
    const activeCount = this.participants.filter(
      (p) => p.event_id === eventId && p.participant_status !== "cancelled"
    ).length;

    if (activeCount >= event.capacity) {
      return { success: false, message: "Kèo này đã đủ số lượng người đăng ký" };
    }

    const existing = this.participants.find(
      (p) => p.event_id === eventId && p.user_id === userId
    );

    if (existing && existing.participant_status !== "cancelled") {
      return { success: false, message: "Bạn đã đăng ký tham gia kèo này rồi" };
    }

    if (existing) {
      existing.participant_status = "registered";
      existing.cancelled_at = null;
    } else {
      this.participants.push({
        id: `part_${Date.now()}`,
        event_id: eventId,
        user_id: userId,
        role: "member",
        participant_status: "registered",
        joined_at: new Date().toISOString(),
        cancelled_at: null,
        checkin_id: null,
        location_sharing_enabled: false,
        last_location_at: null,
      });
    }

    return { success: true, message: "Đăng ký tham gia thành công!" };
  }

  // Leave / Cancel RSVP
  leaveEvent(eventId: string, userId: string): { success: boolean; message: string; penalized: boolean } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Kèo không tồn tại", penalized: false };

    const participant = this.participants.find(
      (p) => p.event_id === eventId && p.user_id === userId
    );
    if (!participant || participant.participant_status === "cancelled") {
      return { success: false, message: "Bạn chưa đăng ký kèo này", penalized: false };
    }

    const now = new Date();
    const deadline = new Date(event.cancellation_deadline);
    const isLateCancel = now > deadline;

    participant.participant_status = "cancelled";
    participant.cancelled_at = now.toISOString();
    participant.location_sharing_enabled = false;

    // Apply reputation penalty if cancelled after deadline
    if (isLateCancel) {
      const stat = this.stats.find(
        (s) => s.group_id === event.group_id && s.user_id === userId
      );
      if (stat) {
        stat.reputation_score = Math.max(0, stat.reputation_score - 3);
        this.reputationTransactions.push({
          id: `rep_${Date.now()}`,
          group_id: event.group_id,
          user_id: userId,
          event_id: eventId,
          delta: -3,
          reason_code: "LATE_CANCELLATION",
          description: `Hủy kèo sau hạn quy định: ${event.title}`,
          created_by: "system",
          idempotency_key: `late_cancel_${eventId}_${userId}`,
          created_at: now.toISOString(),
        });
      }
      return {
        success: true,
        message: "Bạn đã hủy sau hạn quy định (-3 điểm uy tín trong nhóm)",
        penalized: true,
      };
    }

    return { success: true, message: "Hủy tham gia thành công (miễn phí trước hạn)", penalized: false };
  }

  // Propose a venue (Google Place)
  proposePlace(
    eventId: string,
    userId: string,
    place: {
      google_place_id: string;
      place_name: string;
      formatted_address: string;
      latitude: number;
      longitude: number;
      google_maps_uri?: string;
    }
  ): { success: boolean; message: string; place?: EventPlace } {
    // Check if place already proposed
    const existing = this.places.find(
      (p) => p.event_id === eventId && p.google_place_id === place.google_place_id
    );
    if (existing) {
      return { success: false, message: "Quán này đã được bạn bè đề xuất trong kèo" };
    }

    const newPlace: EventPlace = {
      id: `place_${Date.now()}`,
      event_id: eventId,
      proposed_by: userId,
      google_place_id: place.google_place_id,
      place_name: place.place_name,
      formatted_address: place.formatted_address,
      latitude: place.latitude,
      longitude: place.longitude,
      google_maps_uri: place.google_maps_uri || null,
      photo_reference: null,
      created_at: new Date().toISOString(),
    };

    this.places.push(newPlace);
    return { success: true, message: "Đề xuất quán thành công!", place: newPlace };
  }

  // Vote or change vote for a venue
  votePlace(eventId: string, placeId: string, userId: string): { success: boolean; message: string } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Kèo không tồn tại" };
    if (event.venue_poll_status !== "open") {
      return { success: false, message: "Bình chọn đã đóng" };
    }

    const existingVote = this.votes.find(
      (v) => v.event_id === eventId && v.user_id === userId
    );

    if (existingVote) {
      existingVote.place_id = placeId;
      existingVote.updated_at = new Date().toISOString();
    } else {
      this.votes.push({
        id: `vote_${Date.now()}`,
        event_id: eventId,
        place_id: placeId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return { success: true, message: "Đã ghi nhận bình chọn của bạn!" };
  }

  // Close venue poll and lock winning venue
  closeVenuePoll(eventId: string, hostId: string): { success: boolean; message: string; selectedPlace?: EventPlace } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Kèo không tồn tại" };
    if (event.host_id !== hostId) {
      return { success: false, message: "Chỉ chủ kèo mới có quyền đóng bình chọn" };
    }

    const eventPlaces = this.places.filter((p) => p.event_id === eventId);
    if (eventPlaces.length === 0) {
      return { success: false, message: "Chưa có quán nào được đề xuất để chốt" };
    }

    // Count votes
    const voteCounts = eventPlaces.map((p) => {
      const count = this.votes.filter((v) => v.place_id === p.id).length;
      return { place: p, count };
    });

    voteCounts.sort((a, b) => b.count - a.count);
    const winning = voteCounts[0].place;

    event.venue_poll_status = "closed";
    event.selected_place_id = winning.id;
    event.updated_at = new Date().toISOString();

    return { success: true, message: `Đã chốt quán: ${winning.place_name}`, selectedPlace: winning };
  }

  // Live Location: Update position
  updateLiveLocation(
    eventId: string,
    userId: string,
    lat: number,
    lng: number,
    accuracy: number,
    heading?: number,
    speed?: number
  ) {
    const existing = this.liveLocations.find(
      (l) => l.event_id === eventId && l.user_id === userId
    );

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60000).toISOString();

    if (existing) {
      existing.latitude = lat;
      existing.longitude = lng;
      existing.accuracy_m = accuracy;
      existing.heading = heading || null;
      existing.speed = speed || null;
      existing.updated_at = now.toISOString();
      existing.expires_at = expiresAt;
    } else {
      this.liveLocations.push({
        id: `loc_${Date.now()}`,
        event_id: eventId,
        user_id: userId,
        latitude: lat,
        longitude: lng,
        accuracy_m: accuracy,
        heading: heading || null,
        speed: speed || null,
        updated_at: now.toISOString(),
        expires_at: expiresAt,
      });
    }

    // Mark participant as traveling and location enabled
    const participant = this.participants.find(
      (p) => p.event_id === eventId && p.user_id === userId
    );
    if (participant) {
      participant.location_sharing_enabled = true;
      participant.participant_status = "traveling";
      participant.last_location_at = now.toISOString();
    }
  }

  // Stop location sharing
  stopLocationSharing(eventId: string, userId: string) {
    const participant = this.participants.find(
      (p) => p.event_id === eventId && p.user_id === userId
    );
    if (participant) {
      participant.location_sharing_enabled = false;
    }
  }

  // Checkin Session: Host opens QR code
  createCheckinSession(eventId: string, hostId: string, hostLat?: number, hostLng?: number) {
    const sessionId = `session_${Date.now()}`;
    const { token, nonce, expiresAt } = generateSignedQrToken(eventId, sessionId, hostId);

    const session: CheckinSession = {
      id: sessionId,
      event_id: eventId,
      host_id: hostId,
      token_hash: token,
      nonce,
      issued_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      revoked_at: null,
      host_latitude: hostLat || null,
      host_longitude: hostLng || null,
      status: "active",
    };

    this.checkinSessions.push(session);
    return { session, token, expiresAt };
  }

  // Get active checkin session
  getActiveCheckinSession(eventId: string): { session: CheckinSession; token: string } | null {
    const session = this.checkinSessions
      .filter((s) => s.event_id === eventId && s.status === "active")
      .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())[0];

    if (!session) return null;

    // Check if expired
    if (new Date() > new Date(session.expires_at)) {
      // Re-generate rotating QR token
      const { token, nonce, expiresAt } = generateSignedQrToken(
        eventId,
        session.id,
        session.host_id
      );
      session.token_hash = token;
      session.nonce = nonce;
      session.expires_at = expiresAt.toISOString();
    }

    return { session, token: session.token_hash };
  }

  // Process Participant Check-in (GPS + QR)
  processCheckin(
    eventId: string,
    userId: string,
    qrToken: string,
    userLat: number,
    userLng: number,
    accuracy: number
  ): { success: boolean; message: string; repDelta?: number; xpDelta?: number } {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return { success: false, message: "Kèo không tồn tại" };

    const participant = this.participants.find(
      (p) => p.event_id === eventId && p.user_id === userId
    );
    if (!participant) return { success: false, message: "Bạn chưa đăng ký tham gia kèo này" };

    if (participant.participant_status === "checked_in") {
      return { success: false, message: "Bạn đã check-in thành công trước đó rồi" };
    }

    // Verify Venue Coordinates
    const venue = this.places.find((p) => p.id === event.selected_place_id);
    if (!venue) return { success: false, message: "Chưa có địa điểm đã chốt để xác minh vị trí" };

    // Stop location sharing on checkin
    participant.location_sharing_enabled = false;
    participant.participant_status = "checked_in";

    const checkinRecord: Checkin = {
      id: `checkin_${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      participant_id: participant.id,
      checkin_session_id: null,
      verification_method: "gps_qr",
      checked_in_at: new Date().toISOString(),
      distance_to_venue_m: 45, // Demo within 100m
      gps_accuracy_m: accuracy,
      verification_status: "verified",
    };
    this.checkins.push(checkinRecord);
    participant.checkin_id = checkinRecord.id;

    // Reputation & XP reward
    const repDelta = 3;
    const xpDelta = 20;

    const stat = this.stats.find(
      (s) => s.group_id === event.group_id && s.user_id === userId
    );
    if (stat) {
      stat.reputation_score += repDelta;
      stat.xp_total += xpDelta;
      stat.streak_count += 1;
      stat.last_qualified_event_at = new Date().toISOString();

      this.reputationTransactions.push({
        id: `rep_${Date.now()}`,
        group_id: event.group_id,
        user_id: userId,
        event_id: eventId,
        delta: repDelta,
        reason_code: "CHECKIN_ON_TIME",
        description: `Check-in GPS + QR đúng giờ: ${event.title}`,
        created_by: "system",
        idempotency_key: `checkin_${eventId}_${userId}`,
        created_at: new Date().toISOString(),
      });

      this.xpTransactions.push({
        id: `xp_${Date.now()}`,
        group_id: event.group_id,
        user_id: userId,
        event_id: eventId,
        delta: xpDelta,
        reason_code: "CHECKIN_ON_TIME",
        idempotency_key: `checkin_xp_${eventId}_${userId}`,
        created_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `Check-in thành công! Bạn nhận được +${repDelta} điểm uy tín và +${xpDelta} XP trong nhóm.`,
      repDelta,
      xpDelta,
    };
  }

  // Group Leaderboard
  getGroupLeaderboard(groupId: string, userId: string) {
    const isMember = this.groupMembers.some(
      (m) => m.group_id === groupId && m.user_id === userId && m.membership_status === "active"
    );
    if (!isMember) return [];

    const groupStats = this.stats.filter((s) => s.group_id === groupId);
    return groupStats
      .map((s) => {
        const profile = this.profiles.find((p) => p.id === s.user_id);
        const badges = this.userBadges
          .filter((ub) => ub.group_id === groupId && ub.user_id === s.user_id)
          .map((ub) => this.badges.find((b) => b.id === ub.badge_id))
          .filter(Boolean) as Badge[];

        return {
          ...s,
          profile,
          badges,
        };
      })
      .sort((a, b) => b.reputation_score - a.reputation_score);
  }
}

// Global Singleton for Development runtime
declare global {
  // eslint-disable-next-line no-var
  var __henCaPheStore: HenCaPheDataStore | undefined;
}

export const dataStore = global.__henCaPheStore || new HenCaPheDataStore();
if (process.env.NODE_ENV !== "production") {
  global.__henCaPheStore = dataStore;
}
