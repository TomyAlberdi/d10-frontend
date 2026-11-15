import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const PRESET_PERCENTS = [5, 10, 15] as const;

interface DiscountPercentPickerProps {
  label: string;
  percent: number;
  onChange: (percent: number) => void;
  disabled?: boolean;
}

const matchesPreset = (percent: number) =>
  PRESET_PERCENTS.find((p) => Math.abs(percent - p) < 0.01);

/**
 * Discount percentage: 5, 10 or 15 percent, or a custom one. Clicking the
 * selected option again removes the discount.
 */
const DiscountPercentPicker = ({
  label,
  percent,
  onChange,
  disabled = false,
}: DiscountPercentPickerProps) => {
  const preset = percent > 0 ? matchesPreset(percent) : undefined;
  const [isCustom, setIsCustom] = useState(
    percent > 0 && preset === undefined,
  );
  const [customText, setCustomText] = useState(
    isCustom ? String(Number(percent.toFixed(2))) : "",
  );

  const setPercent = (value: number) =>
    onChange(Math.min(100, Math.max(0, value)));

  const handlePreset = (value: number) => {
    setIsCustom(false);
    setPercent(!isCustom && preset === value ? 0 : value);
  };

  const handleCustomToggle = () => {
    if (isCustom) {
      setIsCustom(false);
      setCustomText("");
      setPercent(0);
      return;
    }
    setIsCustom(true);
    setCustomText(percent > 0 ? String(Number(percent.toFixed(2))) : "");
  };

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    const value = Number(text.replace(",", "."));
    setPercent(Number.isFinite(value) ? value : 0);
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground block">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_PERCENTS.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={!isCustom && preset === value ? "default" : "outline"}
            onClick={() => handlePreset(value)}
            disabled={disabled}
          >
            {value}%
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant={isCustom ? "default" : "outline"}
          onClick={handleCustomToggle}
          disabled={disabled}
        >
          Personalizado
        </Button>
        {isCustom && (
          <div className="flex items-center gap-1">
            <Input
              type="text"
              inputMode="decimal"
              value={customText}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="0"
              className="h-8 w-20"
              disabled={disabled}
              autoFocus
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountPercentPicker;
