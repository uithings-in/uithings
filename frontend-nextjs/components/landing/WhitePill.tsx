export default function WhitePill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-[30px] border border-[#DEDEDE] bg-white px-3.5 py-1.5 ${className}`}
    >
      <span className="whitespace-nowrap text-lg font-medium leading-[22px] text-black">
        {children}
      </span>
    </div>
  );
}
