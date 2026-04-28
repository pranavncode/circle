export type TabType = 'home' | 'profile' | 'notifications' | 'messages' | 'search';

export interface UserData {
  id: string;
  username: string;
  email: string;
  about?: string;
  skills?: string;
  interests?: string;
  experience?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

export interface Post {
  id?: number;
  title: string;
  caption: string;
  imageUrl?: string;
  createdAt: string;
  user?: {
    username: string;
  };
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ExperienceItem {
  title: string;
  organization: string;
  description: string;
}

// ── New types for Search, Follow, Messages, Notifications ──

export interface FollowUser {
  id: number;
  username: string;
  about?: string;
  skills?: string;
  isFollowing?: boolean;
  createdAt?: string;
}

export interface MessageData {
  id: number;
  content: string;
  read: boolean;
  senderId: number;
  receiverId: number;
  createdAt: string;
  sender: { id: number; username: string };
  receiver: { id: number; username: string };
}

export interface Conversation {
  otherUser: { id: number; username: string; about?: string | null };
  lastMessage: MessageData;
}

export interface NotificationData {
  id: number;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  actorId: number;
  actor: { id: number; username: string };
}