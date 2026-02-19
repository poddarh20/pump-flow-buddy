import { Routes, Route, useLocation } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { usePetrolPumpStore } from '@/hooks/usePetrolPumpStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import Dashboard from './Dashboard';
import MeterReadings from './MeterReadings';
import FuelPrices from './FuelPrices';
import DailyReport from './DailyReport';
import CreditLedger from './CreditLedger';
import OutstandingDues from './OutstandingDues';
import MonthlyView from './MonthlyView';
import Install from './Install';
import { toast } from 'sonner';

// Pages where Save Day is relevant (not credit ledger / outstanding dues / monthly)
const SAVE_RELEVANT_PATHS = ['/', '/readings', '/prices', '/report'];

const Index = () => {
  const store = usePetrolPumpStore();
  const location = useLocation();

  // Show save reminder on pages where data entry happens
  const isSavePage = SAVE_RELEVANT_PATHS.some(p =>
    location.pathname === p || location.pathname.endsWith(p)
  );

  const handleSave = async () => {
    await store.saveDay();
    toast.success('Daily data saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-card">
          <div className="h-14 flex items-center justify-between px-6">
            <span className="text-sm font-medium text-foreground">Shivala Petro Mart</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Date:</span>
              <Input
                type="date"
                value={store.date}
                onChange={e => store.setDate(e.target.value)}
                className="w-40 font-mono bg-secondary border-border text-sm"
              />
              <Button
                onClick={handleSave}
                size="sm"
                disabled={store.saving}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm"
              >
                <Save className="w-4 h-4" />
                {store.saving ? 'Saving...' : 'Save Day'}
              </Button>
            </div>
          </div>
          {/* Auto-save status indicator */}
          {isSavePage && store.saving && (
            <div className="border-t border-border px-6 py-1.5 flex items-center gap-2 bg-muted">
              <span className="text-xs font-medium text-muted-foreground">💾 Auto-saving...</span>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Dashboard store={store} />} />
            <Route path="readings" element={<MeterReadings store={store} />} />
            <Route path="prices" element={<FuelPrices store={store} />} />
            <Route path="report" element={<DailyReport store={store} />} />
            <Route path="credit-ledger" element={<CreditLedger date={store.date} onCreditChange={store.refreshCreditTotal} />} />
            <Route path="outstanding-dues" element={<OutstandingDues />} />
            <Route path="monthly" element={<MonthlyView />} />
            <Route path="install" element={<Install />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Index;
