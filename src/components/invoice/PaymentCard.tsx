import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { REGISTER_TYPE_LABELS, REGISTER_TYPES } from "@/lib/cashRegister";
import { parseAmount, resolvePayment, type PaymentDraft } from "@/lib/invoice";
import { formatPrice } from "@/lib/utils";
import { AlertTriangle, Info } from "lucide-react";

interface PaymentCardProps {
  /** What the sale still owes, in pesos. */
  owed: number;
  draft: PaymentDraft;
  onChange: (draft: PaymentDraft) => void;
  /**
   * The sale can be saved without a payment (an existing debt): the card
   * starts closed behind a "Registrar un pago" switch.
   */
  optional?: boolean;
  disabled?: boolean;
}

/**
 * The money received with this sale. It is saved together with the sale and
 * registered in the chosen cash register, so it cannot be skipped or entered
 * twice. The amount starts at what is owed and can be changed, e.g. rounded.
 */
const PaymentCard = ({
  owed,
  draft,
  onChange,
  optional = false,
  disabled = false,
}: PaymentCardProps) => {
  const resolved = resolvePayment(draft, owed);
  const amount = parseAmount(resolved.amountText);
  const isUsd = draft.registerType === "USD";
  const update = (patch: Partial<PaymentDraft>) =>
    onChange({ ...draft, ...patch });

  return (
    <Card className="p-4">
      <div>
        <h2 className="text-lg font-semibold">Cobro</h2>
        <p className="text-sm text-muted-foreground">
          Se registra en caja al guardar la venta.
        </p>
      </div>

      {optional && (
        <div className="flex items-center gap-3">
          <Switch
            id="register-payment"
            checked={draft.enabled}
            onCheckedChange={(enabled) => update({ enabled })}
            disabled={disabled}
          />
          <label
            htmlFor="register-payment"
            className="text-sm font-medium cursor-pointer"
          >
            Registrar un pago
          </label>
          <span className="text-sm text-muted-foreground">
            Debe $ {formatPrice(owed)}
          </span>
        </div>
      )}

      {(!optional || draft.enabled) && (
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Caja</span>
            <div className="grid grid-cols-3 gap-2">
              {REGISTER_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={draft.registerType === type ? "default" : "outline"}
                  onClick={() => update({ registerType: type })}
                  disabled={disabled}
                >
                  {REGISTER_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Monto recibido{isUsd ? " (USD)" : ""}
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={resolved.amountText}
              onChange={(e) => update({ amount: e.target.value })}
              placeholder="Ej: 1000,50"
              className="max-w-xs"
              disabled={disabled}
            />
            {!isUsd && (
              <p className="text-xs text-muted-foreground mt-1">
                Total a cobrar: $ {formatPrice(owed)}
              </p>
            )}
          </div>

          {resolved.canBePartial && (
            <div className="flex items-center gap-3">
              <Switch
                id="partial-payment"
                checked={draft.partial}
                onCheckedChange={(partial) => update({ partial })}
                disabled={disabled}
              />
              <label
                htmlFor="partial-payment"
                className="text-sm font-medium cursor-pointer"
              >
                Pago parcial
              </label>
            </div>
          )}

          {isUsd && resolved.isPartial && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Equivale a (pesos)
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={draft.pesoAmount}
                onChange={(e) => update({ pesoAmount: e.target.value })}
                placeholder="Ej: 50000"
                className="max-w-xs"
                disabled={disabled}
              />
            </div>
          )}

          {resolved.isPartial && resolved.payment && (
            <div className="flex items-start gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-700 dark:text-orange-400">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <span>
                La venta quedará como Deuda: faltan ${" "}
                {formatPrice(resolved.remaining)}.
              </span>
            </div>
          )}

          {!resolved.isPartial &&
            resolved.payment &&
            !isUsd &&
            Math.abs(amount - owed) >= 0.01 && (
              <div className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span>
                  Se registran $ {formatPrice(amount)} en caja y la venta se da
                  por pagada.
                </span>
              </div>
            )}
        </div>
      )}
    </Card>
  );
};

export default PaymentCard;
