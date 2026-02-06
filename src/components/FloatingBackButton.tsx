import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingBackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      aria-label="Go back"
      className="floating-back-button"
    >
      <Home className="bigger-icon" color="black" />
    </button>
  );
}
