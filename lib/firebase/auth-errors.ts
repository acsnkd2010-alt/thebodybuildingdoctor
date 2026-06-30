export function mapFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked. Trying redirect sign-in…';
    case 'auth/unauthorized-domain':
      return 'This site domain is not authorized for sign-in. Contact support to add it in Firebase.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Try signing in with email and password.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return mapFirebaseAuthError(String(error.code));
  }
  return 'Something went wrong. Please try again.';
}

export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String(error.code);
    if (code.startsWith('auth/')) {
      return mapFirebaseAuthError(code);
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return getFirebaseAuthErrorMessage(error);
}
