'use client';

import { useEffect } from 'react';
import { settle } from '@/lib/motion-lease';

/** A hero with no entrance has nothing to wait for: the deck may start its
 *  clock at once. */
export default function SettleNow() {
  useEffect(() => settle(), []);
  return null;
}
