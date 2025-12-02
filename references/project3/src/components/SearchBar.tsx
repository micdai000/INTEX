import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const SearchBar = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="w-full bg-card border rounded-xl shadow-lg p-6 -mt-10 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="university">University</Label>
          <Select>
            <SelectTrigger id="university">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="byu">BYU</SelectItem>
              <SelectItem value="uvu">UVU</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input id="maxPrice" type="number" placeholder="$500" />
        </div>
        
        <div className="flex items-end">
          <Button className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
      
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="mt-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="private" />
            <Label htmlFor="private" className="text-sm font-normal cursor-pointer">
              Private Room
            </Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input id="minPrice" type="number" placeholder="$200" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roommates">Max Roommates</Label>
              <Input id="roommates" type="number" placeholder="4" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
