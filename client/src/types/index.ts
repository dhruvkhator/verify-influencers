export interface Influencer {
  id: number;
  name: string;
  category: string;
  trustScore: number;
  trending: 'up' | 'down';
  followers: string;
  verifiedClaims: number;
  avatar: string;
}

export interface ResearchTask {
  id: number;
  influencer: string;
  timeRange: string;
  journals: string[];
  status: 'pending' | 'completed';
}