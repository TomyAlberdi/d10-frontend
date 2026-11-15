import DiscountPercentPicker from "./DiscountPercentPicker";

interface DiscountPickerProps {
  /** Sum of the line subtotals the percentage applies to. */
  subtotal: number;
  /** Discount as an amount, the way invoices store it. */
  discount: number;
  onChange: (discount: number) => void;
  disabled?: boolean;
}

const percentOf = (discount: number, subtotal: number) =>
  subtotal > 0 ? (discount / subtotal) * 100 : 0;

/**
 * Discount over the invoice total, picked as a percentage and stored as the
 * amount it takes off the subtotal.
 */
const DiscountPicker = ({
  subtotal,
  discount,
  onChange,
  disabled = false,
}: DiscountPickerProps) => (
  <DiscountPercentPicker
    label="Descuento sobre total"
    percent={percentOf(discount, subtotal)}
    onChange={(percent) => onChange(subtotal * (percent / 100))}
    disabled={disabled}
  />
);

export default DiscountPicker;
