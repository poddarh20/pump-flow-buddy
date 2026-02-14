import { Fuel, Gauge, FileText, CreditCard, DollarSign } from 'lucide-react';
import { NavLink as RouterNavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Gauge, label: 'Dashboard' },
  { to: '/readings', icon: Fuel, label: 'Meter Readings' },
  { to: '/prices', icon: DollarSign, label: 'Fuel Prices' },
  { to: '/report', icon: FileText, label: 'Daily Report' },
  { to: '/ledger', icon: CreditCard, label: 'Ledger' },
];

export function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Fuel className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg leading-tight">FuelDesk</h1>
            <p className="text-xs text-muted-foreground">Pump Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <RouterNavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`
          }>
            <item.icon className="w-4 h-4" />
            {item.label}
          </RouterNavLink>
        ))}
      </nav>
    </aside>
  );
}
