import NegativeStockDialog from "@/components/negative-stock-dialog";
import { NegativeStockError, type StockShortage } from "@/lib/negativeStock";
import { useCallback, useRef, useState } from "react";

/**
 * Runs a stock-reducing action and, if the backend answers that it would leave
 * products below zero, asks the user before running it again with
 * `allowNegativeStock`. Render `dialog` somewhere in the page.
 *
 * `run` resolves to the action's result, or to null when the user cancels.
 * Any other error is rethrown untouched.
 */
export const useNegativeStockConfirm = () => {
  const [shortages, setShortages] = useState<StockShortage[] | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const settle = (confirmed: boolean) => {
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
    setShortages(null);
  };

  const run = useCallback(
    async <T,>(
      action: (allowNegativeStock: boolean) => Promise<T>,
    ): Promise<T | null> => {
      try {
        return await action(false);
      } catch (error) {
        if (!(error instanceof NegativeStockError)) throw error;
        const confirmed = await new Promise<boolean>((resolve) => {
          resolveRef.current = resolve;
          setShortages(error.shortages);
        });
        if (!confirmed) return null;
        return action(true);
      }
    },
    [],
  );

  const dialog = (
    <NegativeStockDialog
      shortages={shortages}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { run, dialog };
};
