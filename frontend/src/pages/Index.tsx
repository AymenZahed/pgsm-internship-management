import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate, isAuthenticated, user, isLoading]);

  return null;
}
