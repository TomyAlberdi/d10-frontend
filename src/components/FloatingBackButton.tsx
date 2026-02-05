import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FloatingBackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="floating-back-button"
    >
      <ChevronLeft className="bigger-icon" color="black" />
    </button>
  );
}
