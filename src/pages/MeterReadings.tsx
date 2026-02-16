import { units } from '@/lib/petrolPumpData';
import { Input } from '@/components/ui/input';
import type { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';

type StoreReturn = ReturnType<typeof usePetrolPumpStore>;

export default function MeterReadings({ store }: { store: StoreReturn }) {
  const { readings, updateReading } = store;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Meter Readings</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter closing readings and testing volume for each nozzle. Opening is auto-populated from previous day.</p>
      </div>

      <div className="space-y-4">
        {units.map(unit => (
          <div key={unit.id} className="bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-4">{unit.name}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Nozzle</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Closing</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Opening</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Testing</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {unit.nozzles.map(nozzle => {
                    const r = readings.find(rd => rd.unitId === unit.id && rd.nozzleName === nozzle.name);
                    const gross = r ? Math.max(0, r.closing - r.opening) : 0;
                    const testing = r?.testing || 0;
                    const volume = Math.max(0, gross - testing);
                    return (
                      <tr key={nozzle.name} className="border-b border-border last:border-0">
                        <td className="py-3 text-foreground">{nozzle.name}</td>
                        <td className="py-3">
                          <Input
                            type="number"
                            value={r?.closing || ''}
                            onChange={e => updateReading(unit.id, nozzle.name, 'closing', Number(e.target.value))}
                            className="w-32 font-mono bg-secondary border-border"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3">
                          <Input
                            type="number"
                            value={r?.opening || ''}
                            readOnly
                            className="w-32 font-mono bg-muted border-border cursor-not-allowed opacity-70"
                            placeholder="Auto"
                          />
                        </td>
                        <td className="py-3">
                          <Input
                            type="number"
                            value={r?.testing || ''}
                            onChange={e => updateReading(unit.id, nozzle.name, 'testing', Number(e.target.value))}
                            className="w-28 font-mono bg-secondary border-border"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 font-mono text-primary">{volume.toFixed(2)} L</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
