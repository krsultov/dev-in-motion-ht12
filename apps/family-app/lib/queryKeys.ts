export const queryKeys = {
  profile: (parentId: string) => ['parent', parentId, 'profile'] as const,
  activity: (parentId: string) => ['parent', parentId, 'activity'] as const,
  activityFeed: (parentId: string) => ['parent', parentId, 'activityFeed'] as const,
  approvals: (parentId: string) => ['parent', parentId, 'approvals'] as const,
  approvalsFeed: (parentId: string) => ['parent', parentId, 'approvalsFeed'] as const,
  memory: (parentId: string) => ['parent', parentId, 'memory'] as const,
};
