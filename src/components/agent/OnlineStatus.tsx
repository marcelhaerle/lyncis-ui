export function OnlineStatus({ online }: { online: boolean }) {
  return (
    <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] ${online ? 'bg-green-500 text-green-500' : 'bg-red-500 text-red-500'}`}></span>
  );
}
