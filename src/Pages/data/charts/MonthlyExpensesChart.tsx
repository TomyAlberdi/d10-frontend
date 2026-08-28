import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataContext } from "@/contexts/data/UseDataContext";
import type {
  CashRegisterType,
  MonthlyCashFlowRecord,
} from "@/interfaces/DataInterfaces";
import { formatPrice, getMonthName } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { useDataFilters } from "../useDataFilters";

const chartConfig = {
  inTotal: {
    label: "Ingresos $",
    color: "var(--chart-2)",
  },
  outTotal: {
    label: "Gastos $",
    color: "var(--chart-1)",
  },
  net: {
    label: "Neto $",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

/** USD is a separate currency, so it is never totalled with the peso registers. */
const REGISTER_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "Todas (ARS + USD)" },
  { value: "PAPER", label: "Efectivo" },
  { value: "DIGITAL", label: "Digital" },
  { value: "USD", label: "Dólares" },
];

const MonthlyExpensesChart = () => {
  const { getMonthlyCashFlow } = useDataContext();
  const { year: SelectedYear } = useDataFilters();

  const [CashFlow, setCashFlow] = useState<MonthlyCashFlowRecord[]>([]);
  const [Register, setRegister] = useState<string>("ALL");

  const fillData = useCallback((data: MonthlyCashFlowRecord[]) => {
    return data.map((record) => ({
      ...record,
      inTotal: parseFloat(record.inTotal.toFixed(2)),
      outTotal: parseFloat(record.outTotal.toFixed(2)),
      net: parseFloat(record.net.toFixed(2)),
      monthName: getMonthName(record.month),
    }));
  }, []);

  useEffect(() => {
    const registerType =
      Register === "ALL" ? undefined : (Register as CashRegisterType);
    getMonthlyCashFlow(SelectedYear, registerType).then(fillData).then(setCashFlow);
  }, [getMonthlyCashFlow, fillData, SelectedYear, Register]);

  const yearNet = CashFlow.reduce((total, record) => total + record.net, 0);

  return (
    <Card className="col-span-4 lg:col-span-2">
      <CardHeader>
        <CardTitle>Ingresos y Gastos Mensuales</CardTitle>
        <CardDescription>
          {SelectedYear} · Neto del año: $ {formatPrice(yearNet)}
        </CardDescription>
        <div className="pt-2">
          <Select value={Register} onValueChange={setRegister}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Caja" />
            </SelectTrigger>
            <SelectContent>
              {REGISTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        <ChartContainer config={chartConfig}>
          <ComposedChart data={CashFlow} margin={{ left: 10, right: 10 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={"monthName"}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="inTotal" fill="var(--chart-2)" radius={2} />
            <Bar dataKey="outTotal" fill="var(--chart-1)" radius={2} />
            <Line
              dataKey="net"
              type="monotone"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MonthlyExpensesChart;
