import { Flair } from './community.model';

export interface Post {
  id: number;
  communityId: number;
  communitySlug: string;
  userId: number;
  title: string;
  content: string;
  imageUrl?: string;
  type: 'DISCUSSION' | 'QUESTION';
  flairId?: number;
  flairName?: string;
  flair?: Flair;
  voteScore: number;
  viewCount: number;
  commentCount?: number;
  userVote?: 1 | -1 | null;
  createdAt: string;
  updatedAt?: string;
}
