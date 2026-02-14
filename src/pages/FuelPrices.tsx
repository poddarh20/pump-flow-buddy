import { fuelTypes, type FuelType, fuelColors } from '@/lib/petrolPumpData';
import { Input } from '@/components/ui/input';
import type { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';

type StoreReturn = ReturnType<typeof usePetrolPumpStore>;

export default function FuelPrices({ store }: { store: StoreReturn }) {
  const { prices, updatePrice } = store;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fuel Prices</h2>
        <p className="text-sm text-muted-foreground mt-1">Set today's prices per liter/unit</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fuelTypes.map(ft => (
          <div key={ft} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: fuelColors[ft] }} />
              <h3 className="font-semibold text-foreground">{ft}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                value={prices[ft] || ''}
                onChange={e => updatePrice(ft, Number(e.target.value))}
                className="font-mono bg-secondary border-border text-lg"
                placeholder="0.00"
                step="0.01"
              />
              <span className="text-muted-foreground text-sm">/L</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
