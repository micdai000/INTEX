import heroImage from "@/assets/hero-housing.jpg";

export const Hero = () => {
  return (
    <section className="relative h-[400px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Find Your Perfect Student Housing
        </h1>
        <p className="text-xl text-white/90 max-w-2xl">
          Buy and sell housing contracts for BYU and UVU students
        </p>
      </div>
    </section>
  );
};
