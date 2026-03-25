'use client';

import { GoogleLogin } from '@react-oauth/google';

interface AuthenticationSectionProps {
  onUseForm: () => void;
  onGoogleSuccess: (credentialResponse: any) => void;
}

export default function AuthenticationSection({ onUseForm, onGoogleSuccess }: AuthenticationSectionProps) {
  return (
    <div className="space-y-6">
      {/* Google Sign-In Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => console.log('Login Failed')}
          theme="filled_blue"
          size="large"
          text="signin_with"
          logo_alignment="left"
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">or</span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
      </div>

      {/* Form Toggle Button */}
      <button
        onClick={onUseForm}
        className="w-full bg-accent-600/10 dark:bg-accent-900/20 hover:bg-accent-600/20 dark:hover:bg-accent-900/30 text-accent-700 dark:text-accent-300 font-semibold py-3 px-6 rounded-lg border border-accent-200 dark:border-accent-800 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      >
        Enter your information manually
      </button>
    </div>
  );
}
