import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, Shield, Star, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LandingPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchCity)}`);
    } else {
      navigate('/search');
    }
  };

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find PGs based on budget, location, and amenities"
    },
    {
      icon: Shield,
      title: "Verified Reviews",
      description: "Read authentic reviews from verified tenants"
    },
    {
      icon: Home,
      title: "Quality Listings",
      description: "Browse through verified PG accommodations"
    },
    {
      icon: Users,
      title: "Safe Community",
      description: "Connect with trusted owners and fellow tenants"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Manrope'}}>PGMatch</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/dashboard')}
                    data-testid="dashboard-nav-btn"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onLogout}
                    data-testid="logout-btn"
                    className="rounded-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => navigate('/auth')}
                  data-testid="login-nav-btn"
                  className="rounded-full bg-accent hover:bg-accent/90 text-white"
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1758270705657-f28eec1a5694?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHVuaXZlcnNpdHklMjBzdHVkZW50cyUyMHN0dWR5aW5nJTIwdG9nZXRoZXJ8ZW58MHx8fHwxNzY3NjE2MTIzfDA&ixlib=rb-4.1.0&q=85"
            alt="Hero background"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6" 
              style={{fontFamily: 'Manrope', letterSpacing: '-0.02em'}}
              data-testid="hero-title"
            >
              Find Your Perfect PG Accommodation
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Discover safe and comfortable living spaces for students and professionals. 
              Search by location, budget, and amenities with verified reviews.
            </p>

            {/* Floating Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-full shadow-lg p-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="Enter city name (e.g., Mumbai, Bangalore)"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="h-12 border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
                  data-testid="search-input"
                />
                <Button 
                  type="submit"
                  className="rounded-full bg-accent hover:bg-accent/90 text-white px-8 h-12 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  data-testid="search-btn"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Trusted Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Prime Locations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl md:text-4xl font-bold text-foreground mb-4" 
              style={{fontFamily: 'Manrope'}}
            >
              Why Choose PGMatch?
            </h2>
            <p className="text-muted-foreground text-lg">Everything you need to find your perfect accommodation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl border border-border hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2" style={{fontFamily: 'Manrope'}}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="bg-primary text-white rounded-3xl p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{fontFamily: 'Manrope'}}>
              Ready to Find Your Perfect PG?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of students and professionals who found their ideal accommodation through PGMatch.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                onClick={() => navigate('/search')}
                className="rounded-full bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                data-testid="browse-listings-btn"
              >
                Browse Listings
              </Button>
              {!user && (
                <Button 
                  onClick={() => navigate('/auth?role=owner')}
                  variant="outline"
                  className="rounded-full border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg transition-all"
                  data-testid="list-property-btn"
                >
                  List Your Property
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              <span className="text-xl font-bold" style={{fontFamily: 'Manrope'}}>PGMatch</span>
            </div>
            <p className="text-sm opacity-70">© 2024 PGMatch. Making accommodation search easier.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;