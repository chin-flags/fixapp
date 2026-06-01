"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";

type ThroughputPoint = {
  date: string;
  created: number;
  closed: number;
};

const chartConfig = {
  created: {
    label: "Created",
    color: "hsl(var(--chart-1))",
  },
  closed: {
    label: "Closed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({ data }: { data: ThroughputPoint[] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("30d");

  const filteredData = useMemo(() => {
    const sliceLength = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : data.length;
    return data.slice(-sliceLength);
  }, [data, timeRange]);

  const totalCreated = filteredData.reduce((sum, item) => sum + item.created, 0);
  const totalClosed = filteredData.reduce((sum, item) => sum + item.closed, 0);
  const closureDelta = totalClosed - totalCreated;

  return (
    <Card className="@container/card overflow-hidden border border-border bg-[radial-gradient(circle_at_top_left,_hsla(291,96%,62%,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_hsla(186,100%,50%,0.1),_transparent_24%)] shadow-sm">
      <CardHeader className="relative">
        <CardTitle className="text-lg text-card-foreground">RCA Throughput</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Created vs. closed RCAs over the selected window.
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(value) => value && setTimeRange(value)}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="42d" className="h-8 px-2.5">
              Last 6 weeks
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-36"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="42d" className="rounded-lg">
                Last 6 weeks
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 px-4 sm:grid-cols-3 sm:px-0">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
            <div className="text-sm font-medium text-primary">Created</div>
            <div className="mt-1 text-2xl font-semibold text-card-foreground">{totalCreated}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <div className="text-sm font-medium text-emerald-400">Closed</div>
            <div className="mt-1 text-2xl font-semibold text-card-foreground">{totalClosed}</div>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3">
            <div className="text-sm font-medium text-accent-foreground">Net movement</div>
            <div className="mt-1 text-2xl font-semibold text-card-foreground">
              {closureDelta > 0 ? "+" : ""}
              {closureDelta}
            </div>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-created)" stopOpacity={0.9} />
                <stop offset="95%" stopColor="var(--color-created)" stopOpacity={0.12} />
              </linearGradient>
              <linearGradient id="fillClosed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-closed)" stopOpacity={0.75} />
                <stop offset="95%" stopColor="var(--color-closed)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={isMobile ? 24 : 20}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    new Date(String(value)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Area
              dataKey="created"
              type="monotone"
              fill="url(#fillCreated)"
              fillOpacity={1}
              stroke="var(--color-created)"
              strokeWidth={2}
            />
            <Area
              dataKey="closed"
              type="monotone"
              fill="url(#fillClosed)"
              fillOpacity={1}
              stroke="var(--color-closed)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
