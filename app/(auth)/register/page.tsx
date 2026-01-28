import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Register | Bodybuilding Media Channel'
};

export default function RegisterPage() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <AuthForm mode="register" />
    </div>
  );
}

