import FloatingGenericMenu from "@/components/FloatingGenericMenu";
import Cell from "./Cell";

const Warehouse = () => {
  return (
    <div className="min-h-screen flex items-center justify-start">
      <section className="w-1/8 flex flex-col justify-start p-4 gap-3">
        <FloatingGenericMenu />
      </section>
      <section className="w-7/8 h-screen p-3 pl-0">
        <div className="bg-card rounded h-full grid grid-rows-10 grid-cols-20">
          {Array.from({ length: 10 }).map((_, rowIdx) => {
            const rowLabel = String.fromCharCode(65 + rowIdx); // A, B, C...
            return Array.from({ length: 20 }).map((_, colIdx) => {
              const colLabel = (colIdx + 1).toString();
              return (
                <Cell
                  key={`${rowLabel}${colLabel}`}
                  row={rowIdx}
                  col={colIdx}
                  rowLabel={rowLabel}
                  colLabel={colLabel}
                />
              );
            });
          })}
        </div>
      </section>
    </div>
  );
};
export default Warehouse;
