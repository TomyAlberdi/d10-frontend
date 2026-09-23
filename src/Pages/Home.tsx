import { HomeQuickAccess } from "@/components/home-quick-access";
import { HomeUpcomingNotes } from "@/components/home-upcoming-notes";
import { isBackendReachable } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Home = () => {
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);

  useEffect(() => {
    async function checkBackend() {
      const available = await isBackendReachable();
      if (available) {
        setBackendAvailable(true);
      } else {
        setBackendAvailable(false);
        toast.error(
          "El servidor de back-end no está disponible. Algunas funciones pueden no funcionar.",
        );
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="min-h-full bg-background flex flex-col items-center justify-center gap-8 p-4 md:p-8">
      {/* show banner when backend is down */}
      {backendAvailable === false && (
        <div className="w-full bg-red-600 text-white py-2 text-center">
          <p>Servidor desconectado. Por favor inténtalo más tarde.</p>
        </div>
      )}
      <h1 className="text-4xl font-bold text-foreground mb-12 text-center alternate-font">
        Diseño 10 Tandil <br /> Administración
      </h1>
      {/* Side by side from lg up, stacked on smaller screens; the grid keeps
          both cards the same size. */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <HomeQuickAccess />
        <HomeUpcomingNotes />
      </div>
    </div>
  );
};

export default Home;
