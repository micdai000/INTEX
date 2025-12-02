import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ImageGallery } from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Flag, Home, Users, Calendar, Bed } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import apartment1 from "@/assets/apartment-1.jpg";
import apartment2 from "@/assets/apartment-2.jpg";
import apartment3 from "@/assets/apartment-3.jpg";
import apartment4 from "@/assets/apartment-4.jpg";

const ListingDetail = () => {
  const { id } = useParams();

  // Mock data - in real app, would fetch based on id
  const listing = {
    title: "Heritage Halls - Female Private Contract",
    price: 450,
    gender: "Female",
    university: "BYU",
    contractType: "Spring/Summer",
    isPrivate: true,
    roommates: 3,
    apartmentType: "Shared",
    images: [apartment1, apartment2, apartment3, apartment4],
    amenities: [
      "Washer/Dryer in Unit",
      "Gym Access",
      "Furnished",
      "Private Bathroom",
      "Pool Access",
      "Study Room",
    ],
    description:
      "Beautiful apartment in Heritage Halls with a private room available for Spring/Summer semester. The apartment is fully furnished and includes all utilities. Great location close to campus with easy access to public transportation. Roommates are friendly and respectful students. Perfect for someone looking for a quiet study environment while still being social when needed.",
    seller: {
      name: "Jane Doe",
      email: "jane@email.com",
      phone: "(801) 555-1234",
    },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ImageGallery images={listing.images} />

              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <p className="text-3xl font-bold text-primary mb-4">
                  ${listing.price}/month <span className="text-lg text-muted-foreground">OBO</span>
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-semibold">{listing.gender}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Home className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">University</p>
                      <p className="font-semibold">{listing.university}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contract</p>
                      <p className="font-semibold text-sm">{listing.contractType}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Bed className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Room Type</p>
                      <p className="font-semibold">{listing.isPrivate ? "Private" : "Shared"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {listing.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Contact Seller</h3>
                    <div className="space-y-3">
                      <p className="font-semibold text-lg">{listing.seller.name}</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${listing.seller.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {listing.seller.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${listing.seller.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {listing.seller.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Mail className="mr-2 h-4 w-4" />
                    Message Seller
                  </Button>

                  <Button variant="outline" className="w-full">
                    <Flag className="mr-2 h-4 w-4" />
                    Report Listing
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetail;
