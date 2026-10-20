import type { CashRegisterTransaction } from "@/interfaces/CashRegisterInterfaces";
import { Link } from "react-router-dom";

/**
 * A transaction's description. When it is linked to a sale, the "#N" in it
 * opens that sale; the link is only underlined, keeping the text's color.
 */
const TransactionDescription = ({
  transaction,
}: {
  transaction: CashRegisterTransaction;
}) => {
  const { description, invoiceId, invoiceNumber } = transaction;
  const token = invoiceNumber ? `#${invoiceNumber}` : null;
  if (!description) return <>—</>;
  if (!invoiceId || !token || !description.includes(token)) {
    return <>{description}</>;
  }
  const at = description.indexOf(token);
  return (
    <>
      {description.slice(0, at)}
      <Link to={`/invoice/${invoiceId}`} className="underline">
        {token}
      </Link>
      {description.slice(at + token.length)}
    </>
  );
};

export default TransactionDescription;
