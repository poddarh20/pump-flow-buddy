import { Fuel, TrendingUp, ArrowDownRight, Wallet } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import {
  calculateSales, calculateInflow, calculateTotalOutflow,
  fuelTypes, fuelColors, type FuelType,
} from '@/lib/petrolPumpData';
import type { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';

type StoreReturn = ReturnType<typeof usePetrolPumpStore>;

interface DashboardProps {
  store: StoreReturn;
}

export default function Dashboard({ store }: DashboardProps) {
  const { date, readings, prices, outflow } = store;
  const sales = calculateSales(readings);
  const inflow = calculateInflow(sales, prices);
  const totalOutflow = calculateTotalOutflow(outflow);
  const balance = inflow - totalOutflow;
  const totalLiters = fuelTypes.reduce((s, ft) => s + sales[ft], 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Daily overview for {date}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Volume" value={`${totalLiters.toFixed(1)} L`} icon={Fuel} variant="primary" />
        <StatCard title="Total Inflow" value={`₹${inflow.toFixed(0)}`} icon={TrendingUp} variant="success" />
        <StatCard title="Total Outflow" value={`₹${totalOutflow.toFixed(0)}`} icon={ArrowDownRight} />
        <StatCard title="Balance" value={`₹${balance.toFixed(0)}`} icon={Wallet} variant={balance >= 0 ? 'success' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Fuel Sales Breakdown</h3>
          <div className="space-y-3">
            {fuelTypes.map(ft => {
              const vol = sales[ft];
              const maxVol = Math.max(...fuelTypes.map(f => sales[f]), 1);
              const pct = (vol / maxVol) * 100;
              return (
                <div key={ft}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{ft}</span>
                    <span className="font-mono text-foreground">{vol.toFixed(1)} L</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: fuelColors[ft] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4">Revenue by Fuel</h3>
          <div className="space-y-3">
            {fuelTypes.map(ft => {
              const amt = sales[ft] * prices[ft];
              return (
                <div key={ft} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fuelColors[ft] }} />
                    <span className="text-sm text-muted-foreground">{ft}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">₹{amt.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
