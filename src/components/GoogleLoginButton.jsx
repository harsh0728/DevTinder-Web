export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full py-3 rounded-lg bg-white text-black font-semibold shadow flex items-center justify-center gap-2"
    >
      <img src="/google.svg" className="w-5 h-5" />
      Continue with Google
    </button>
  );
}
