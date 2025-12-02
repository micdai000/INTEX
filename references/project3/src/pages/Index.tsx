import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { SearchBar } from "@/components/SearchBar";
import { ListingCard } from "@/components/ListingCard";
import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";
import apartment4 from "@/assets/apartment-4.jpg";

const MOCK_LISTINGS = [
  {
    id: "1",
    image: apartment1,
    title: "Heritage Halls - Female Private Contract",
    price: 450,
    gender: "Female",
    university: "BYU",
    isPrivate: true,
  },
  {
    id: "2",
    image: apartment2,
    title: "Campus Plaza - Male Shared Room",
    price: 320,
    gender: "Male",
    university: "BYU",
    isPrivate: false,
  },
  {
    id: "3",
    image: apartment3,
    title: "UV Apartments - Female Contract",
    price: 380,
    gender: "Female",
    university: "UVU",
    isPrivate: true,
  },
  {
    id: "4",
    image: apartment4,
    title: "Riverside Apartments - Male Private",
    price: 425,
    gender: "Male",
    university: "UVU",
    isPrivate: true,
  },
  {
    id: "5",
    image: apartment1,
    title: "Wyview Park - Female Shared",
    price: 350,
    gender: "Female",
    university: "BYU",
    isPrivate: false,
  },
  {
    id: "6",
    image: apartment2,
    title: "The Village - Male Contract",
    price: 395,
    gender: "Male",
    university: "UVU",
    isPrivate: true,
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <Hero />
        
        <div className="container mx-auto px-4">
          <SearchBar />
          
          <section className="py-12">
            <h2 className="text-3xl font-bold mb-8">Recent Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_LISTINGS.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
