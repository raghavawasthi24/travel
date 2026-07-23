import { Icon } from './icons.jsx';

const ICON_BY_TYPE = {
  Flight: Icon.Flight,
  Accommodation: Icon.Hotel,
  Transportation: Icon.Bus,
  Package: Icon.Package,
};

/** Service icon + label, mirroring the mock (icon on top, caption below). */
export default function ServiceCell({ service }) {
  const I = ICON_BY_TYPE[service?.type] || Icon.Package;
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <I width={20} height={20} className="text-brand" />
      {service?.destination && (
        <span className="text-xs font-medium text-gray-700">{service.destination}</span>
      )}
      {service?.label && (
        <span className={service?.destination
          ? 'rounded bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand'
          : 'text-xs text-gray-600'}>
          {service.label}
        </span>
      )}
    </div>
  );
}
