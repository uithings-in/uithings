export default function TypographyMockup() {
  return (
    <div className="relative h-full min-h-[280px] w-full overflow-hidden bg-[#07071d] lg:h-[366px]">
      <img
        src="/landing/mockup-branding.png"
        alt="Typography anatomy diagram"
        className="absolute inset-0 size-full object-cover"
      />
      <img
        src="/landing/mockup-swatches.png"
        alt=""
        className="absolute left-6 top-4 h-[51px] w-[145px] object-cover"
      />
    </div>
  );
}
