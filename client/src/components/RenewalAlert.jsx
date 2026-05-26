import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AlertTriangle, X, CalendarClock } from 'lucide-react';

export default function RenewalAlert() {
  const [entries, setEntries] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/domains/expiring')
      .then((res) => setEntries(res.data))
      .catch(() => {});
  }, []);

  if (dismissed || entries.length === 0) return null;

  const getSeverity = (date) => {
    if (!date) return null;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (days <= 7) return 'critical';
    if (days <= 14) return 'warning';
    return 'info';
  };

  const severities = entries.flatMap((e) => {
    const s = [];
    if (e.domainExpiryDate) s.push(getSeverity(e.domainExpiryDate));
    if (e.hostingExpiryDate) s.push(getSeverity(e.hostingExpiryDate));
    return s;
  });

  const maxSeverity = severities.includes('critical') ? 'critical' : severities.includes('warning') ? 'warning' : 'info';

  const colors = {
    critical: 'border-red-500/30 bg-red-500/10 text-red-200',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  };

  const icons = {
    critical: AlertTriangle,
    warning: CalendarClock,
    info: CalendarClock,
  };

  const Icon = icons[maxSeverity];

  return (
    <div className={`${colors[maxSeverity]} border-b backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Icon size={16} className="shrink-0" />
            <span className="text-sm font-medium truncate">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} expiring soon
            </span>
            <Link
              to="/domains"
              className="text-sm font-medium underline-offset-2 underline hover:no-underline opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              View details
            </Link>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/5 ml-4"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
