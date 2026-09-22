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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { formatCompact } from "./format";

interface MetricAreaChartProps {
  title: string;
  description?: string;
  data: Record<string, unknown>[] | null;
  dataKey: string;
  label: string;
  /** A --chart-N css variable. */
  color: string;
  valueFormatter: (value: number) => string;
  /** Controls rendered at the top right of the card. */
  action?: ReactNode;
  /** One line under the chart, e.g. the yearly figure. */
  footer?: ReactNode;
  className?: string;
}

/**
 * A single monthly metric drawn as a gradient filled area. Months with no
 * sales arrive as null and are left as a gap rather than a dive to zero.
 */
const MetricAreaChart = ({
  title,
  description,
  data,
  dataKey,
  label,
  color,
  valueFormatter,
  action,
  footer,
  className,
}: MetricAreaChartProps) => {
  const chartConfig = {
    [dataKey]: { label, color },
  } satisfies ChartConfig;
  const gradientId = `fill-${dataKey}`;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className="px-3">
        {data === null ? (
          <Skeleton className="aspect-video w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-video w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ left: 0, right: 12, top: 8 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${dataKey})`}
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${dataKey})`}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="monthName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => (
                      <div className="flex w-full justify-between gap-4">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums">
                          {valueFormatter(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey={dataKey}
                type="monotone"
                stroke={`var(--color-${dataKey})`}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={{ r: 3, fill: `var(--color-${dataKey})` }}
                activeDot={{ r: 5 }}
                connectNulls={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      {footer && (
        <CardFooter className="text-muted-foreground text-sm">{footer}</CardFooter>
      )}
    </Card>
  );
};
export default MetricAreaChart;
