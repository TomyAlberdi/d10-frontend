import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useDataContext } from "@/contexts/data/UseDataContext";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyCashFlow } from "@/interfaces/DataInterfaces";
import { REGISTER_TYPE_LABELS } from "@/lib/cashRegister";
import { getMonthName } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CURRENT_YEAR, formatCompact, formatMoney } from "../components/format";

type IncomeMode = "SALES" | "TRANSACTIONS";

const MODE_LABELS: Record<IncomeMode, string> = {
  SALES: "Ventas",
  TRANSACTIONS: "Transacciones",
};

const MODE_DESCRIPTIONS: Record<IncomeMode, string> = {
  SALES: "Ventas cobradas y pagos de deudas",
  TRANSACTIONS: "Ingresos registrados en caja, sin egresos ni USD",
};

interface IncomeRow {
  month: number;
  monthName: string;
  income: number;
  settledIncome?: number;
  debtPayments?: number;
  paperIncome?: number;
  digitalIncome?: number;
}

/**
 * In sales mode the bar is the money the month took in, split by where it
 * came from. A sale left on account still brings cash in when the client pays
 * part of it, and showing that part next to the settled sales is what keeps
 * the month from looking emptier than it was.
 */
const salesChartConfig = {
  settledIncome: {
    label: "Ventas cobradas $",
    color: "var(--chart-2)",
  },
  debtPayments: {
    label: "Pagos de deudas $",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

/**
 * In transactions mode the bar is every IN movement of the peso registers,
 * whatever its origin, split by register. USD is left out because adding
 * dollars to pesos would make the total meaningless. Transactions written
 * before the registers were split carry no register and count as cash.
 */
const transactionsChartConfig = {
  paperIncome: {
    label: `${REGISTER_TYPE_LABELS.PAPER} $`,
    color: "var(--chart-2)",
  },
  digitalIncome: {
    label: `${REGISTER_TYPE_LABELS.DIGITAL} $`,
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

const round2 = (value: number) => parseFloat(value.toFixed(2));

const MonthlySalesChart = () => {
  const { getYearlySalesData, getMonthlyCashFlow } = useDataContext();

  const [mode, setMode] = useState<IncomeMode>("SALES");
  const [rowsByMode, setRowsByMode] = useState<
    Partial<Record<IncomeMode, IncomeRow[]>>
  >({});

  const rows = rowsByMode[mode] ?? null;

  useEffect(() => {
    if (rowsByMode[mode]) return;
    let ignore = false;

    const load: Promise<IncomeRow[]> =
      mode === "SALES"
        ? getYearlySalesData(CURRENT_YEAR).then((data) =>
            data.map((record) => ({
              month: record.month,
              monthName: getMonthName(record.month),
              income: round2(record.income),
              settledIncome: round2(record.settledIncome),
              debtPayments: round2(record.debtPayments),
            })),
          )
        : // Cash is whatever the unfiltered total holds beyond DIGITAL and USD,
          // so untyped transactions land in it and the bar still adds up to
          // every peso taken in.
          Promise.all([
            getMonthlyCashFlow(CURRENT_YEAR),
            getMonthlyCashFlow(CURRENT_YEAR, "DIGITAL"),
            getMonthlyCashFlow(CURRENT_YEAR, "USD"),
          ]).then(([all, digital, usd]) =>
            all.map((record) => {
              const inOf = (rows: MonthlyCashFlow[]) =>
                rows.find((r) => r.month === record.month)?.inTotal ?? 0;
              const digitalIncome = inOf(digital);
              const pesoIncome = record.inTotal - inOf(usd);
              return {
                month: record.month,
                monthName: getMonthName(record.month),
                income: round2(pesoIncome),
                paperIncome: round2(pesoIncome - digitalIncome),
                digitalIncome: round2(digitalIncome),
              };
            }),
          );

    load.then((data) => {
      if (!ignore) setRowsByMode((prev) => ({ ...prev, [mode]: data }));
    });
    return () => {
      ignore = true;
    };
  }, [mode, rowsByMode, getYearlySalesData, getMonthlyCashFlow]);

  const yearIncome = rows?.reduce((acc, r) => acc + r.income, 0) ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos Mensuales</CardTitle>
        <CardDescription>
          {MODE_DESCRIPTIONS[mode]} · {CURRENT_YEAR}
        </CardDescription>
        <CardAction className="flex gap-1">
          {(Object.keys(MODE_LABELS) as IncomeMode[]).map((value) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? "default" : "outline"}
              onClick={() => setMode(value)}
            >
              {MODE_LABELS[value]}
            </Button>
          ))}
        </CardAction>
      </CardHeader>
      <CardContent className="px-3">
        {rows === null ? (
          <Skeleton className="aspect-video w-full" />
        ) : (
          <ChartContainer
            config={
              mode === "SALES" ? salesChartConfig : transactionsChartConfig
            }
            className="aspect-video w-full"
          >
            <BarChart
              accessibilityLayer
              data={rows}
              margin={{ left: 0, right: 12, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={"monthName"}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              {mode === "SALES" ? (
                <>
                  <Bar
                    dataKey="settledIncome"
                    stackId="income"
                    fill="var(--color-settledIncome)"
                  />
                  <Bar
                    dataKey="debtPayments"
                    stackId="income"
                    fill="var(--color-debtPayments)"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="paperIncome"
                    stackId="income"
                    fill="var(--color-paperIncome)"
                  />
                  <Bar
                    dataKey="digitalIncome"
                    stackId="income"
                    fill="var(--color-digitalIncome)"
                    radius={[4, 4, 0, 0]}
                  />
                </>
              )}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      {rows && (
        <CardFooter className="text-muted-foreground text-sm">
          <span>
            Total del año:{" "}
            <b className="text-foreground">{formatMoney(yearIncome)}</b>
          </span>
        </CardFooter>
      )}
    </Card>
  );
};
export default MonthlySalesChart;
