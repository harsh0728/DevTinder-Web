export default function ProfileField({ label, value }) {
  return (
    <div className="border-b border-slate-700 pb-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg text-slate-200">{value}</p>
    </div>
  );
}

