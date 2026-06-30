import type { ReactNode } from 'react';

import { requireLearnerPage } from '@/lib/auth/require-learner';

export default async function LearnLayout({ children }: { children: ReactNode }) {
  await requireLearnerPage();
  return children;
}
