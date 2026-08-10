export function logoutToSignIn() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.clear();
  window.sessionStorage.clear();

  document.cookie.split(';').forEach((cookie) => {
    const cookieName = cookie.split('=')[0]?.trim();
    if (!cookieName) {
      return;
    }

    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  window.location.href = '/sign-up-login-screen';
}
