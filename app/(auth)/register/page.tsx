import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Register | Bodybuilding Media Channel',
};

export default function RegisterPage() {
  redirect('/login');
}
