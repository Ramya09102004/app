import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, MapPin, Star, Bed, Users, Utensils, Calendar, Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PGDetailPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pg, setPg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [inquiryData, setInquiryData] = useState({ message: "", preferred_date: "" });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "", stay_duration: "" });

  useEffect(() => {
    fetchPGDetails();
    fetchReviews();
  }, [id]);

  const fetchPGDetails = async () => {
    try {
      const response = await axios.get(`${API}/pgs/${id}`);
      setPg(response.data);
    } catch (error) {
      console.error("Error fetching PG details:", error);
      toast.error("Failed to load PG details");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to send inquiry");
      navigate('/auth');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/inquiries`,
        { pg_id: id, ...inquiryData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Inquiry sent successfully!");
      setInquiryOpen(false);
      setInquiryData({ message: "", preferred_date: "" });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send inquiry");
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit review");
      navigate('/auth');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/reviews`,
        { pg_id: id, ...reviewData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted successfully!");
      setReviewOpen(false);
      setReviewData({ rating: 5, comment: "", stay_duration: "" });
      fetchReviews();
      fetchPGDetails();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit review");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!pg) {
    return <div className="min-h-screen flex items-center justify-center">PG not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} data-testid="back-btn">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Home className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold text-primary" style={{fontFamily: 'Manrope'}}>PGMatch</span>
              </div>
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
        {/* Image Gallery */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="aspect-video rounded-2xl overflow-hidden">
            <img 
              src={pg.images[selectedImage] || "https://images.unsplash.com/photo-1745221847962-0397cc719b8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxtb2Rlcm4lMjBjb3p5JTIwYmVkcm9vbSUyMGludGVyaW9yJTIwc3R1ZGVudHxlbnwwfHx8fDE3Njc2MTYxMjF8MA&ixlib=rb-4.1.0&q=85"}
              alt={pg.title}
              className="w-full h-full object-cover"
              data-testid="main-image"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {pg.images.slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                className={`aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-border'
                }`}
                onClick={() => setSelectedImage(idx)}
                data-testid={`thumbnail-${idx}`}
              >
                <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{fontFamily: 'Manrope'}} data-testid="pg-title">
                    {pg.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span>{pg.address}, {pg.city}</span>
                  </div>
                </div>
                {pg.review_count > 0 && (
                  <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="text-lg font-bold text-accent">{pg.rating}</span>
                    <span className="text-sm text-muted-foreground">({pg.review_count} reviews)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                  <Bed className="w-5 h-5 text-primary" />
                  <span className="capitalize font-medium">{pg.room_type} Sharing</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="capitalize font-medium">{pg.gender_preference}</span>
                </div>
                {pg.food_included && (
                  <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                    <Utensils className="w-5 h-5 text-primary" />
                    <span className="font-medium">Food Included</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Available from {pg.available_from}</span>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{fontFamily: 'Manrope'}}>Description</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="pg-description">{pg.description}</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{fontFamily: 'Manrope'}}>Amenities</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {pg.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold" style={{fontFamily: 'Manrope'}}>Reviews</h2>
                {user && user.role === 'seeker' && (
                  <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full" data-testid="write-review-btn">
                        Write a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleReview} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Rating</Label>
                          <select
                            value={reviewData.rating}
                            onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                            data-testid="review-rating-select"
                          >
                            {[5, 4, 3, 2, 1].map(num => (
                              <option key={num} value={num}>{num} Stars</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Stay Duration (Optional)</Label>
                          <Input
                            value={reviewData.stay_duration}
                            onChange={(e) => setReviewData({...reviewData, stay_duration: e.target.value})}
                            placeholder="e.g., 6 months"
                            data-testid="review-duration-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Your Review</Label>
                          <Textarea
                            value={reviewData.comment}
                            onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                            placeholder="Share your experience..."
                            rows={4}
                            required
                            data-testid="review-comment-textarea"
                          />
                        </div>
                        <Button type="submit" className="w-full rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="review-submit-btn">
                          Submit Review
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{review.user_name}</span>
                          {review.verified && (
                            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary">Verified</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-accent fill-accent" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      {review.stay_duration && (
                        <p className="text-sm text-muted-foreground mb-2">Stayed for: {review.stay_duration}</p>
                      )}
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary price-font" data-testid="pg-price">₹{pg.price.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">{pg.owner_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium capitalize">{pg.room_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium capitalize">{pg.gender_preference}</span>
                </div>
              </div>

              <Dialog open={inquiryOpen} onOpenChange={setInquiryOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full rounded-full bg-accent hover:bg-accent/90 text-white mb-3" data-testid="send-inquiry-btn">
                    Send Inquiry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Inquiry</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleInquiry} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Visit Date (Optional)</Label>
                      <Input
                        type="date"
                        value={inquiryData.preferred_date}
                        onChange={(e) => setInquiryData({...inquiryData, preferred_date: e.target.value})}
                        data-testid="inquiry-date-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={inquiryData.message}
                        onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                        placeholder="Hi, I'm interested in this PG..."
                        rows={4}
                        required
                        data-testid="inquiry-message-textarea"
                      />
                    </div>
                    <Button type="submit" className="w-full rounded-full bg-accent hover:bg-accent/90 text-white" data-testid="inquiry-submit-btn">
                      Send Inquiry
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <p className="text-xs text-muted-foreground text-center">
                Your contact details will be shared with the owner
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetailPage;