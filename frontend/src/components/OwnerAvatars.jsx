/** Overlapping owner monogram chips (AS AK SR VG ...). */
export default function OwnerAvatars({ owners = [], max = 4 }) {
  const shown = owners.slice(0, max);
  const extra = owners.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((o, i) => (
        <div
          key={o._id || i}
          title={o.name}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[11px] font-bold ring-1"
          style={{ marginLeft: i === 0 ? 0 : -10, color: o.avatarColor, ['--tw-ring-color']: o.avatarColor }}
        >
          {o.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="ml-[-10px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[11px] font-bold text-gray-500">
          +{extra}
        </div>
      )}
    </div>
  );
}
