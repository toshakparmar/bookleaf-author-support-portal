import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('bookleaf_token')?.value;

  if (!token) {
    redirect('/login');
  }

  // Probe current role
  try {
    const apiTarget = process.env.API_INTERNAL_URL || 'http://localhost:3001';
    const res = await fetch(`${apiTarget}/api/v1/auth/me`, {
      headers: { Cookie: `bookleaf_token=${token}` },
      cache: 'no-store',
    });

    if (res.ok) {
      const user = await res.json();
      if (user.role === 'ADMIN') {
        redirect('/admin/tickets');
      } else {
        redirect('/author/books');
      }
    }
  } catch {
    // If backend unreachable or invalid session
  }

  redirect('/login');
}
