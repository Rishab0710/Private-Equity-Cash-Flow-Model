'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Scale,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

function StatCard({ title, value, change, icon: Icon, subItems }: any) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            {change}
          </p>
        )}
        {subItems && (
          <div className="flex space-x-2 mt-2">
            {subItems.map((item: any, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className={
                  item.type === 'creation'
                    ? 'text-green-400 border-green-400/50'
                    : 'text-red-400 border-red-400/50'
                }
              >
                {item.value} {item.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CashPositionCard() {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash Position
          </CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$37.1M</div>
        <p className="text-xs text-muted-foreground">2.6% of Total AUM</p>
        <Progress value={45} className="w-full h-1 mt-2" />
      </CardContent>
    </Card>
  );
}

function PortfolioBenchmarkCard() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Portfolio vs. Benchmark
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mtd" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="mtd" className="text-xs h-6">MTD</TabsTrigger>
            <TabsTrigger value="qtd" className="text-xs h-6">QTD</TabsTrigger>
            <TabsTrigger value="ytd" className="text-xs h-6">YTD</TabsTrigger>
          </TabsList>
          <TabsContent value="mtd">
            <div className="flex justify-between text-center mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Portfolio</p>
                <p className="font-bold text-lg text-green-400">+2.1%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Benchmark</p>
                <p className="font-bold text-lg text-green-400">+1.9%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="font-bold text-lg text-green-400">+0.20%</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RiskVolatilityCard() {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Risk & Volatility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="1y" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="1y" className="text-xs h-6">1Y</TabsTrigger>
              <TabsTrigger value="3y" className="text-xs h-6">3Y</TabsTrigger>
              <TabsTrigger value="5y" className="text-xs h-6">5Y</TabsTrigger>
            </TabsList>
            <TabsContent value="1y">
              <div className="flex justify-between text-center mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Volatility</p>
                  <p className="font-bold text-lg">12.5%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
                  <p className="font-bold text-lg">1.23</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tracking Error</p>
                  <p className="font-bold text-lg text-red-400">3.2%</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

export function LeftSidebar() {
  return (
    <div className="space-y-6">
      <StatCard
        title="Daily AUM"
        value="$1,450.3M"
        change="0.5% vs last day"
        icon={Scale}
      />
      <StatCard
        title="Daily Flows"
        value="$4.9M Net"
        icon={Activity}
        subItems={[
          { value: '+$6.7M', label: 'Creations', type: 'creation' },
          { value: '$-1.8M', label: 'Redemptions', type: 'redemption' },
        ]}
      />
      <CashPositionCard />
      <PortfolioBenchmarkCard />
      <RiskVolatilityCard />
    </div>
  );
}
