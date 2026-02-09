export default function GoogleLoginButton() {
  const handleLogin = () => {
    window.location.href =
  import.meta.env.VITE_CLIENT_ENV === "production"?"https://devtinder-1-pqv8.onrender.com/api/auth/google": "http://localhost:3000/api/auth/google";
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full mt-3 py-2 rounded-lg bg-white text-black font-semibold shadow flex items-center justify-center gap-2"
    >
      <img src={"../public/google.jpg"} className="w-10 h-10" />
      Continue with Google
    </button>
  );
}
