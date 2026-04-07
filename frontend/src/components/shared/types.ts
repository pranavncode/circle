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