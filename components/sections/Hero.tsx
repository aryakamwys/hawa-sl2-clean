export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sedang dibuat bruh
          </h1>
          <p className="text-lg md:text-xl text-white mb-8">
            Halaman home sedang dalam proses pembuatan
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn btn-soft btn-primary">
              Get Started
            </button>
            <button className="btn btn-soft">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}