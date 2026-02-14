import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'success';
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-card border-primary/30',
  success: 'bg-card border-success/30',
};

const iconStyles = {
  default: 'bg-secondary text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
};

export function StatCard({ title, value, icon: Icon, subtitle, variant = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-5 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
