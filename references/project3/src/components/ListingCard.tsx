import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ListingCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  gender: string;
  university: string;
  isPrivate?: boolean;
}

export const ListingCard = ({ 
  id, 
  image, 
  title, 
  price, 
  gender, 
  university,
  isPrivate 
}: ListingCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-[var(--card-shadow-hover)] cursor-pointer">
      <Link to={`/listing/${id}`}>
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
          <p className="text-2xl font-bold text-primary mb-3">${price}/month</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{gender}</Badge>
            <Badge variant="outline">{university}</Badge>
            {isPrivate && <Badge variant="default">Private</Badge>}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};
