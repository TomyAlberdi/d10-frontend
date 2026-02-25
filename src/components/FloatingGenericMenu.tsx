import { ChevronLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const FloatingGenericMenu = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-16 flex justify-between gap-3">
      <Button onClick={() => navigate(-1)} className="w-[46%] h-full">
        <ChevronLeft className="bigger-icon" color="black" />
      </Button>
      <Button onClick={() => navigate("/")} className="w-[46%] h-full">
        <Home className="bigger-icon" color="black" />
      </Button>
    </div>
  );
};
export default FloatingGenericMenu;
