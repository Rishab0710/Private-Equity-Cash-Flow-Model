import { redirect } from 'next/navigation';

export default function RootIndex() {
  // We don't want an infinite loop. 
  // Since src/app/(app)/page.tsx exists, it handles the '/' route.
  // We can just return null here or a simple redirect if needed, 
  // but usually in this structure, we want the route group to take over.
  return null;
}
