export default function Loading() {
  return (
    <section className="container-luxe py-10 md:py-14">
      <div className="mb-8 h-3 w-48 animate-pulse bg-mist" />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="aspect-square animate-pulse bg-mist" />
        <div className="space-y-5">
          <div className="h-3 w-24 animate-pulse bg-mist" />
          <div className="h-10 w-3/4 animate-pulse bg-mist" />
          <div className="h-6 w-32 animate-pulse bg-mist" />
          <div className="h-20 w-full animate-pulse bg-mist" />
          <div className="h-14 w-full animate-pulse bg-mist" />
        </div>
      </div>
    </section>
  );
}
