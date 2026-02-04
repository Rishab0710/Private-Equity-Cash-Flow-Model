import { redirect } from 'next/navigation';

export default function RootIndex() {
  // Redirecting to the route group version to ensure AppLayout wrapping
  redirect('/');
}
