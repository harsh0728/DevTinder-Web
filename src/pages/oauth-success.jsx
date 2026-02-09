import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { apiFetch } from "../api/apiFetch";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search);
    // const token = urlParams.get("token");
    // if (!token) return navigate("/login");
    // // Save token to cookie
    // // document.cookie = `token=${token}; path=/;`;
    // localStorage.setItem("token", token);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const res = await apiFetch("/profile/view");
    if (res.success) {
      dispatch(addUser(res.data));
      navigate("/feed");
    }
  };

  return <div className="text-white">Logging you in...</div>;
}
