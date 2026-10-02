export default function Loading() {
  return (
    <>
      <div className="h-56 animate-pulse bg-charcoal/90 md:h-72" />
      <section className="container-luxe py-12 md:py-16">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] animate-pulse bg-mist" />
              <div className="h-3 w-1/3 animate-pulse bg-mist" />
              <div className="h-4 w-2/3 animate-pulse bg-mist" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
