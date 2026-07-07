import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function WorkerOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAuthenticated) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user?.isAuthenticated) {
    return null; // or loading spinner
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Worker Overview</h1>
    </div>
  );
}

export default WorkerOverview;
