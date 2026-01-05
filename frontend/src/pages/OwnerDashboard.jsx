import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Plus, MapPin, Star, Edit, Trash2, Calendar, User, Mail, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const OwnerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPG, setSelectedPG] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    price: "",
    room_type: "single",
    amenities: [],
    images: [],
    available_from: "",
    food_included: false,
    gender_preference: "any"
  });

  const availableAmenities = [
    "WiFi", "AC", "Attached Bathroom", "Power Backup", "TV", "Fridge",
    "Washing Machine", "Hot Water", "Parking", "Security", "Gym", "Elevator"
  ];

  const defaultImages = [
    "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1609587639086-b4cbf85e4355?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1677658288024-b6b9ed29354e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85",
    "https://images.unsplash.com/photo-1675118546055-32c56579cc58?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yJTIwc3Vubnl8ZW58MHx8fHwxNzY3NjE2MTI1fDA&ixlib=rb-4.1.0&q=85"
  ];

  useEffect(() => {
    fetchListings();
    fetchInquiries();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/pgs/owner/my-listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(response.data);
    } catch (error) {
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/inquiries/received`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(response.data);
    } catch (error) {
      console.error("Failed to fetch inquiries");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        images: defaultImages
      };
      await axios.post(`${API}/pgs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("PG listing created successfully!");
      setCreateOpen(false);
      resetForm();
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create listing");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };
      await axios.put(`${API}/pgs/${selectedPG.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("PG listing updated successfully!");
      setEditOpen(false);
      setSelectedPG(null);
      resetForm();
      fetchListings();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update listing");
    }
  };

  const handleDelete = async (pgId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/pgs/${pgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Listing deleted successfully");
      fetchListings();
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  const openEditDialog = (pg) => {
    setSelectedPG(pg);
    setFormData({
      title: pg.title,
      description: pg.description,
      address: pg.address,
      city: pg.city,
      price: pg.price.toString(),
      room_type: pg.room_type,
      amenities: pg.amenities,
      images: pg.images,
      available_from: pg.available_from,
      food_included: pg.food_included,
      gender_preference: pg.gender_preference
    });
    setEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      address: "",
      city: "",
      price: "",
      room_type: "single",
      amenities: [],
      images: [],
      available_from: "",
      food_included: false,
      gender_preference: "any"
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const PGForm = ({ onSubmit, submitText }) => (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Comfortable PG near Metro Station"
          required
          data-testid="pg-title-input"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Describe your PG..."
          rows={3}
          required
          data-testid="pg-description-input"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Address</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Street address"
            required
            data-testid="pg-address-input"
          />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="Mumbai"
            required
            data-testid="pg-city-input"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Price (per month)</Label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            placeholder="12000"
            required
            data-testid="pg-price-input"
          />
        </div>
        <div className="space-y-2">
          <Label>Available From</Label>
          <Input
            type="date"
            value={formData.available_from}
            onChange={(e) => setFormData({...formData, available_from: e.target.value})}
            required
            data-testid="pg-available-input"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Room Type</Label>
          <Select value={formData.room_type} onValueChange={(value) => setFormData({...formData, room_type: value})}>
            <SelectTrigger data-testid="pg-roomtype-select">
              <SelectValue />
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
          <Select value={formData.gender_preference} onValueChange={(value) => setFormData({...formData, gender_preference: value})}>
            <SelectTrigger data-testid="pg-gender-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="any">Any</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.food_included}
            onCheckedChange={(checked) => setFormData({...formData, food_included: checked})}
            id="food-included"
            data-testid="pg-food-checkbox"
          />
          <Label htmlFor="food-included" className="cursor-pointer">Food Included</Label>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableAmenities.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                checked={formData.amenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
                id={amenity}
                data-testid={`amenity-${amenity.toLowerCase().replace(/\s/g, '-')}`}
              />
              <Label htmlFor={amenity} className="cursor-pointer text-sm">{amenity}</Label>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="pg-form-submit-btn">
        {submitText}
      </Button>
    </form>
  );

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
              <Button variant="ghost" onClick={() => navigate('/')} data-testid="home-nav-btn">
                Home
              </Button>
              <Button variant="outline" onClick={onLogout} className="rounded-full" data-testid="logout-btn">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{fontFamily: 'Manrope'}} data-testid="dashboard-title">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your PG listings and inquiries</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="create-listing-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New PG Listing</DialogTitle>
              </DialogHeader>
              <PGForm onSubmit={handleCreate} submitText="Create Listing" />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList>
            <TabsTrigger value="listings" data-testid="listings-tab">My Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries ({inquiries.length})</TabsTrigger>
            <TabsTrigger value="profile" data-testid="profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : listings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't created any listings yet</p>
                <Button onClick={() => setCreateOpen(true)} className="rounded-full bg-accent hover:bg-accent/90 text-white">
                  Create Your First Listing
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((pg) => (
                  <Card key={pg.id} className="overflow-hidden" data-testid={`listing-card-${pg.id}`}>
                    <div className="aspect-video overflow-hidden">
                      <img src={pg.images[0]} alt={pg.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Manrope'}}>{pg.title}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{pg.city}</span>
                      </div>
                      {pg.review_count > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="font-medium">{pg.rating}</span>
                          <span className="text-sm text-muted-foreground">({pg.review_count} reviews)</span>
                        </div>
                      )}
                      <p className="text-2xl font-bold text-primary price-font mb-4">₹{pg.price.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-full"
                          onClick={() => openEditDialog(pg)}
                          data-testid={`edit-btn-${pg.id}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-full text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(pg.id)}
                          data-testid={`delete-btn-${pg.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit PG Listing</DialogTitle>
                </DialogHeader>
                <PGForm onSubmit={handleUpdate} submitText="Update Listing" />
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="inquiries" className="mt-6">
            {inquiries.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No inquiries received yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{fontFamily: 'Manrope'}}>
                          {inquiry.pg_title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>Received on {new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{inquiry.user_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{inquiry.user_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{inquiry.user_phone}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{inquiry.message}</p>
                    {inquiry.preferred_date && (
                      <p className="text-sm text-muted-foreground">Preferred visit date: {inquiry.preferred_date}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6" style={{fontFamily: 'Manrope'}}>Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-muted-foreground">PG Owner</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OwnerDashboard;