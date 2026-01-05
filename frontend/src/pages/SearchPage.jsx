import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Home, Search, Filter, MapPin, Star, Bed, Users, Utensils } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || "",
    minPrice: 0,
    maxPrice: 50000,
    roomType: "",
    genderPreference: "",
    amenities: []
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice > 0) params.append('min_price', filters.minPrice);
      if (filters.maxPrice < 50000) params.append('max_price', filters.maxPrice);
      if (filters.roomType) params.append('room_type', filters.roomType);
      if (filters.genderPreference) params.append('gender_preference', filters.genderPreference);

      const response = await axios.get(`${API}/pgs?${params.toString()}`);
      setPgs(response.data);
    } catch (error) {
      console.error("Error fetching PGs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchPGs();
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Home className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Manrope'}}>PGMatch</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="dashboard-nav-btn">
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={onLogout} className="rounded-full" data-testid="logout-btn">
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/auth')} className="rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="login-nav-btn">
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <Label>Search by City</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Enter city name"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && fetchPGs()}
                  className="pl-10"
                  data-testid="city-search-input"
                />
              </div>
            </div>
            <Button 
              onClick={fetchPGs} 
              className="rounded-full bg-primary hover:bg-primary/90"
              data-testid="search-apply-btn"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full"
              data-testid="filter-toggle-btn"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mt-4 p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Price Range (₹/month)</Label>
                  <div className="pt-4">
                    <Slider
                      min={0}
                      max={50000}
                      step={1000}
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={(value) => setFilters({...filters, minPrice: value[0], maxPrice: value[1]})}
                      data-testid="price-slider"
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground price-font">
                      <span>₹{filters.minPrice}</span>
                      <span>₹{filters.maxPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={filters.roomType} onValueChange={(value) => setFilters({...filters, roomType: value})}>
                    <SelectTrigger data-testid="room-type-select">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="double">Double</SelectItem>
                      <SelectItem value="triple">Triple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Gender Preference</Label>
                  <Select value={filters.genderPreference} onValueChange={(value) => setFilters({...filters, genderPreference: value})}>
                    <SelectTrigger data-testid="gender-select">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={handleApplyFilters} className="w-full rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="apply-filters-btn">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{fontFamily: 'Manrope'}} data-testid="results-count">
            {loading ? "Loading..." : `${pgs.length} PGs Found`}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading accommodations...</div>
          ) : pgs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No PGs found matching your criteria</p>
              <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
                Go Back Home
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pgs.map((pg) => (
                <Card 
                  key={pg.id}
                  className="overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/pg/${pg.id}`)}
                  data-testid={`pg-card-${pg.id}`}
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={pg.images[0] || "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85"}
                      alt={pg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-foreground" style={{fontFamily: 'Manrope'}}>
                        {pg.title}
                      </h3>
                      {pg.review_count > 0 && (
                        <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="text-sm font-medium text-accent">{pg.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{pg.city}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span className="capitalize">{pg.room_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="capitalize">{pg.gender_preference}</span>
                      </div>
                      {pg.food_included && (
                        <div className="flex items-center gap-1">
                          <Utensils className="w-4 h-4" />
                          <span>Food</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div>
                        <p className="text-2xl font-bold text-primary price-font">₹{pg.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                      <Button className="rounded-full bg-accent hover:bg-accent/90 text-white" data-testid={`view-details-btn-${pg.id}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;