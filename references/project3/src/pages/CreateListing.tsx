import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const CreateListing = () => {
  const navigate = useNavigate();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesList = [
    "Private Room",
    "Washer/Dryer in Unit",
    "Gym Access",
    "Pool Access",
    "Furnished",
    "Private Bathroom",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Listing created successfully!");
    setTimeout(() => navigate("/"), 1500);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Post Your Housing Contract</CardTitle>
              <p className="text-muted-foreground">
                Fill out the details below to list your housing contract
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apartmentName">Apartment Complex Name *</Label>
                  <Input
                    id="apartmentName"
                    placeholder="e.g., Heritage Halls"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your apartment, roommates, location, etc."
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Monthly Rent Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="450"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">University *</Label>
                    <Select required>
                      <SelectTrigger id="university">
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="byu">BYU</SelectItem>
                        <SelectItem value="uvu">UVU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Contract Gender *</Label>
                    <Select required>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="any">Any</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractTerm">Contract Term *</Label>
                    <Select required>
                      <SelectTrigger id="contractTerm">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="fall-winter">Fall/Winter</SelectItem>
                        <SelectItem value="spring-summer">Spring/Summer</SelectItem>
                        <SelectItem value="year-long">Year-Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <Label
                          htmlFor={amenity}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Image URLs (Optional)</Label>
                  <Input placeholder="Image URL 1" type="url" />
                  <Input placeholder="Image URL 2" type="url" />
                  <Input placeholder="Image URL 3" type="url" />
                  <p className="text-xs text-muted-foreground">
                    Enter URLs of images showing your apartment
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" size="lg" className="flex-1">
                    Submit Listing
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;
