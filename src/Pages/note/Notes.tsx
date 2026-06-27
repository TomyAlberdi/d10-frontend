import { Outlet } from "react-router-dom";

const Notes = () => {
  return (
    <div className="min-h-full flex flex-col items-center justify-center">
      <section className="w-full md:w-5/8 h-auto py-0 md:py-5">
        <Outlet />
      </section>
    </div>
  );
};

export default Notes;
