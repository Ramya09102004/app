import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MapPin, Star, Calendar, User } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UserDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/inquiries/my-inquiries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInquiries(response.data);
    } catch (error) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
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
              <Button variant="ghost" onClick={() => navigate('/search')} data-testid="search-nav-btn">
                Browse PGs
              </Button>
              <Button variant="outline" onClick={onLogout} className="rounded-full" data-testid="logout-btn">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{fontFamily: 'Manrope'}} data-testid="dashboard-title">
            My Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>

        <Tabs defaultValue="inquiries" className="w-full">
          <TabsList>
            <TabsTrigger value="inquiries" data-testid="inquiries-tab">My Inquiries</TabsTrigger>
            <TabsTrigger value="profile" data-testid="profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries" className="mt-6">
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : inquiries.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't sent any inquiries yet</p>
                <Button onClick={() => navigate('/search')} className="rounded-full bg-accent hover:bg-accent/90 text-white">
                  Browse PGs
                </Button>
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
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Sent on {new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{inquiry.message}</p>
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
                    <p className="text-muted-foreground">{user.role === 'seeker' ? 'PG Seeker' : 'PG Owner'}</p>
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

export default UserDashboard;