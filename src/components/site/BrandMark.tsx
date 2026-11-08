export function BrandMark({ className = "size-6" }: { className?: string }) {
  return (
    <img
      src="/favicon-192.png"
      alt=""
      aria-hidden="true"
      className={`${className} object-contain`}
    />
  );
}
