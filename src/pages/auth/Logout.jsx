import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // prevent double run
    hasRun.current = true;

    const run = async () => {
      await logout();
      navigate("/login");
    };

    run();
  }, [logout, navigate]);

  return <p className="text-center mt-10">Logging out...</p>;
}

export default Logout;
