import { Icon } from './icons.jsx';

/** Home / Finance / Bookings */
export default function Breadcrumb({ items = ['Finance', 'Bookings'] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Icon.Home width={18} height={18} className="text-gray-500" />
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={item} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            <span className={last ? 'font-semibold text-brand' : 'text-gray-500'}>
              {item}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
