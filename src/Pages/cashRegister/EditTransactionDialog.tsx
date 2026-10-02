import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCashRegisterContext } from "@/contexts/cashRegister/UseCashRegisterContext";
import type {
  CashRegisterTransaction,
  CashRegisterTransactionType,
  CashRegisterType,
} from "@/interfaces/CashRegisterInterfaces";
import { REGISTER_TYPE_LABELS } from "@/lib/cashRegister";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import TransactionDescription from "@/components/invoice/TransactionDescription";

const TYPE_OPTIONS: { value: CashRegisterTransactionType; label: string }[] = [
  { value: "IN", label: "Ingreso" },
  { value: "OUT", label: "Egreso" },
];

/** Peso registers a transaction can move between; USD stays apart. */
const PESO_REGISTERS: CashRegisterType[] = ["PAPER", "DIGITAL"];

const signed = (amount: number, type: CashRegisterTransactionType) =>
  type === "OUT" ? -amount : amount;

interface EditTransactionDialogProps {
  /** Transaction being edited; the dialog is open while this is not null. */
  transaction: CashRegisterTransaction | null;
  onClose: () => void;
  /** Called after a successful save, e.g. to refresh totals. */
  onSaved?: (updated: CashRegisterTransaction) => void;
}

/**
 * Edits the direction, amount and description of a cash register transaction.
 * The register stays the same; the preview shows how its balance moves.
 */
const EditTransactionDialog = ({
  transaction,
  onClose,
  onSaved,
}: EditTransactionDialogProps) => {
  return (
    <AlertDialog
      open={transaction !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        {transaction && (
          // Keyed so the form starts from the transaction each time it opens.
          <EditTransactionForm
            key={transaction.id}
            transaction={transaction}
            onClose={onClose}
            onSaved={onSaved}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

const EditTransactionForm = ({
  transaction,
  onClose,
  onSaved,
}: {
  transaction: CashRegisterTransaction;
  onClose: () => void;
  onSaved?: (updated: CashRegisterTransaction) => void;
}) => {
  const { updateTransaction, paperAmount, digitalAmount, usdAmount } =
    useCashRegisterContext();

  const [type, setType] = useState<CashRegisterTransactionType>(
    transaction.type,
  );
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description ?? "");
  // Transactions from before the registers were split have no register and
  // are counted in the cash one, as the backend does.
  const originalRegister: CashRegisterType =
    transaction.registerType ?? "PAPER";
  const [registerType, setRegisterType] =
    useState<CashRegisterType>(originalRegister);
  const [isSaving, setIsSaving] = useState(false);

  const canChangeRegister = PESO_REGISTERS.includes(originalRegister);
  const currentRegisterAmount: Record<CashRegisterType, number> = {
    PAPER: paperAmount,
    DIGITAL: digitalAmount,
    USD: usdAmount,
  };

  const parsedAmount = Number(amount.replace(",", "."));
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const oldSigned = signed(transaction.amount, transaction.type);
  const newSigned = isValidAmount ? signed(parsedAmount, type) : oldSigned;

  // Each register touched by the edit, with its amount now and after saving.
  const previews =
    registerType === originalRegister
      ? [
          {
            register: originalRegister,
            before: currentRegisterAmount[originalRegister],
            after:
              currentRegisterAmount[originalRegister] - oldSigned + newSigned,
          },
        ]
      : [
          {
            register: originalRegister,
            before: currentRegisterAmount[originalRegister],
            after: currentRegisterAmount[originalRegister] - oldSigned,
          },
          {
            register: registerType,
            before: currentRegisterAmount[registerType],
            after: currentRegisterAmount[registerType] + newSigned,
          },
        ];
  const hasChanges =
    type !== transaction.type ||
    parsedAmount !== transaction.amount ||
    registerType !== originalRegister ||
    description.trim() !== (transaction.description ?? "").trim();

  const handleSave = async () => {
    if (!isValidAmount) return;
    setIsSaving(true);
    try {
      const updated = await updateTransaction(transaction.id, {
        type,
        amount: parsedAmount,
        description: description.trim() || undefined,
        registerType,
      });
      onSaved?.(updated);
      onClose();
    } catch {
      // Error already reported by the context; keep the form open
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>Editar transacción</AlertDialogTitle>
        <AlertDialogDescription>
          {canChangeRegister
            ? new Date(transaction.dateTime).toLocaleString()
            : `Caja ${REGISTER_TYPE_LABELS[originalRegister]} · ${new Date(transaction.dateTime).toLocaleString()}`}
        </AlertDialogDescription>
        {transaction.invoiceId && (
          <p className="text-sm text-muted-foreground">
            Vinculada a la venta{" "}
            <TransactionDescription
              transaction={{
                ...transaction,
                description: `#${transaction.invoiceNumber}`,
              }}
            />
            . Editarla cambia solo la caja, no el estado ni el pago de la venta.
          </p>
        )}
      </AlertDialogHeader>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Tipo</span>
          <div className="grid grid-cols-2 gap-2">
            {TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={type === option.value ? "default" : "outline"}
                onClick={() => setType(option.value)}
                disabled={isSaving}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {canChangeRegister && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Caja</span>
            <div className="grid grid-cols-2 gap-2">
              {PESO_REGISTERS.map((register) => (
                <Button
                  key={register}
                  variant={registerType === register ? "default" : "outline"}
                  onClick={() => setRegisterType(register)}
                  disabled={isSaving}
                >
                  {REGISTER_TYPE_LABELS[register]}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Monto</label>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ej: 1000,50"
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción de la transacción"
            disabled={isSaving}
            rows={3}
          />
        </div>

        <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
          {previews.map(({ register, before, after }) => (
            <div key={register}>
              <p className="text-muted-foreground">
                Monto en caja {REGISTER_TYPE_LABELS[register]}
              </p>
              <p className="font-medium">
                $ {formatPrice(before)}
                {after !== before && <> → $ {formatPrice(after)}</>}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
        <Button
          onClick={handleSave}
          disabled={!isValidAmount || !hasChanges || isSaving}
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export default EditTransactionDialog;
