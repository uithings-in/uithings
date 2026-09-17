export default function ResponsiveMockup() {
  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#07071d] lg:h-[366px]">
      <img
        src="/landing/mockup-responsive-alt.png"
        alt="Responsive design across devices"
        className="absolute inset-0 size-full object-cover object-bottom"
      />
    </div>
  );
}
