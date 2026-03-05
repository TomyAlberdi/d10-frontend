const Cell = ({
  row,
  col,
  rowLabel,
  colLabel,
}: {
  row: number;
  col: number;
  rowLabel: string;
  colLabel: string;
}) => {
  return (
    <div
      key={`${rowLabel}${colLabel}`}
      className="flex items-center justify-center border border-gray-200"
    >
      <span className="text-xs font-medium">
        {rowLabel}
        {colLabel}
      </span>
    </div>
  );
};
export default Cell;
