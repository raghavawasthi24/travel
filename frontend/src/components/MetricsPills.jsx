import { Icon } from './icons.jsx';
import { formatINR } from '../utils/format.js';

/**
 * Renders the three top placeholders. Colour/tone is driven entirely by the
 * backend metrics payload — the client never decides red vs green.
 */
function Pill({ icon: I, label, value, tone }) {
  const toneClass =
    tone === 'red' ? 'text-red-500' : tone === 'green' ? 'text-emerald-500' : 'text-gray-700';
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
      <I width={18} height={18} className="text-gray-400" />
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${toneClass}`}>{formatINR(value)}</span>
    </div>
  );
}

export default function MetricsPills({ metrics, loading }) {
  if (loading || !metrics) {
    return (
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-11 w-40 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Pill icon={Icon.Calculator} label="Net" value={metrics.net.value} tone={metrics.net.tone} />
      <Pill icon={Icon.ArrowOut} label="You Give" value={metrics.youGive.value} tone="red" />
      <Pill icon={Icon.ArrowIn} label="You Get" value={metrics.youGet.value} tone="green" />
    </div>
  );
}
