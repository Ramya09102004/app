import requests
import sys
import json
from datetime import datetime

class PGFinderAPITester:
    def __init__(self, base_url="https://pgmatch-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.seeker_token = None
        self.owner_token = None
        self.seeker_user = None
        self.owner_user = None
        self.test_pg_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        return success

    def test_user_registration(self):
        """Test user registration for both seeker and owner"""
        timestamp = datetime.now().strftime("%H%M%S")
        
        # Test seeker registration
        seeker_data = {
            "name": f"Test Seeker {timestamp}",
            "email": f"seeker{timestamp}@test.com",
            "password": "testpass123",
            "phone": "+91 9876543210",
            "role": "seeker"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/register", json=seeker_data)
            if response.status_code == 200:
                data = response.json()
                self.seeker_token = data['token']
                self.seeker_user = data['user']
                seeker_success = self.log_test("Seeker Registration", True)
            else:
                seeker_success = self.log_test("Seeker Registration", False, f"Status: {response.status_code}")
        except Exception as e:
            seeker_success = self.log_test("Seeker Registration", False, str(e))

        # Test owner registration
        owner_data = {
            "name": f"Test Owner {timestamp}",
            "email": f"owner{timestamp}@test.com",
            "password": "testpass123",
            "phone": "+91 9876543211",
            "role": "owner"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/register", json=owner_data)
            if response.status_code == 200:
                data = response.json()
                self.owner_token = data['token']
                self.owner_user = data['user']
                owner_success = self.log_test("Owner Registration", True)
            else:
                owner_success = self.log_test("Owner Registration", False, f"Status: {response.status_code}")
        except Exception as e:
            owner_success = self.log_test("Owner Registration", False, str(e))

        return seeker_success and owner_success

    def test_user_login(self):
        """Test user login"""
        if not self.seeker_user:
            return self.log_test("User Login", False, "No seeker user to test login")
            
        login_data = {
            "email": self.seeker_user['email'],
            "password": "testpass123"
        }
        
        try:
            response = requests.post(f"{self.api_url}/auth/login", json=login_data)
            if response.status_code == 200:
                return self.log_test("User Login", True)
            else:
                return self.log_test("User Login", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("User Login", False, str(e))

    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.seeker_token:
            return self.log_test("Get User Profile", False, "No token available")
            
        try:
            headers = {"Authorization": f"Bearer {self.seeker_token}"}
            response = requests.get(f"{self.api_url}/auth/me", headers=headers)
            if response.status_code == 200:
                return self.log_test("Get User Profile", True)
            else:
                return self.log_test("Get User Profile", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get User Profile", False, str(e))

    def test_create_pg_listing(self):
        """Test creating PG listing (owner only)"""
        if not self.owner_token:
            return self.log_test("Create PG Listing", False, "No owner token available")
            
        pg_data = {
            "title": "Test PG Near Metro Station",
            "description": "Comfortable and affordable PG accommodation for students and professionals",
            "address": "123 Test Street, Near Metro Station",
            "city": "Mumbai",
            "price": 15000.0,
            "room_type": "double",
            "amenities": ["WiFi", "AC", "Attached Bathroom", "Power Backup"],
            "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            "available_from": "2024-02-01",
            "food_included": True,
            "gender_preference": "any"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.post(f"{self.api_url}/pgs", json=pg_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.test_pg_id = data['id']
                return self.log_test("Create PG Listing", True)
            else:
                return self.log_test("Create PG Listing", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            return self.log_test("Create PG Listing", False, str(e))

    def test_get_all_pgs(self):
        """Test getting all PG listings"""
        try:
            response = requests.get(f"{self.api_url}/pgs")
            if response.status_code == 200:
                data = response.json()
                return self.log_test("Get All PGs", True, f"Found {len(data)} PGs")
            else:
                return self.log_test("Get All PGs", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get All PGs", False, str(e))

    def test_search_pgs_with_filters(self):
        """Test PG search with filters"""
        try:
            # Test city filter
            response = requests.get(f"{self.api_url}/pgs?city=Mumbai")
            if response.status_code == 200:
                city_success = self.log_test("Search PGs by City", True)
            else:
                city_success = self.log_test("Search PGs by City", False, f"Status: {response.status_code}")

            # Test price filter
            response = requests.get(f"{self.api_url}/pgs?min_price=10000&max_price=20000")
            if response.status_code == 200:
                price_success = self.log_test("Search PGs by Price", True)
            else:
                price_success = self.log_test("Search PGs by Price", False, f"Status: {response.status_code}")

            # Test room type filter
            response = requests.get(f"{self.api_url}/pgs?room_type=double")
            if response.status_code == 200:
                room_success = self.log_test("Search PGs by Room Type", True)
            else:
                room_success = self.log_test("Search PGs by Room Type", False, f"Status: {response.status_code}")

            return city_success and price_success and room_success
        except Exception as e:
            return self.log_test("Search PGs with Filters", False, str(e))

    def test_get_pg_details(self):
        """Test getting specific PG details"""
        if not self.test_pg_id:
            return self.log_test("Get PG Details", False, "No test PG ID available")
            
        try:
            response = requests.get(f"{self.api_url}/pgs/{self.test_pg_id}")
            if response.status_code == 200:
                return self.log_test("Get PG Details", True)
            else:
                return self.log_test("Get PG Details", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get PG Details", False, str(e))

    def test_update_pg_listing(self):
        """Test updating PG listing"""
        if not self.owner_token or not self.test_pg_id:
            return self.log_test("Update PG Listing", False, "Missing owner token or PG ID")
            
        update_data = {
            "title": "Updated Test PG Near Metro Station",
            "description": "Updated description for the PG",
            "address": "123 Test Street, Near Metro Station",
            "city": "Mumbai",
            "price": 16000.0,
            "room_type": "double",
            "amenities": ["WiFi", "AC", "Attached Bathroom", "Power Backup", "TV"],
            "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            "available_from": "2024-02-01",
            "food_included": True,
            "gender_preference": "any"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.put(f"{self.api_url}/pgs/{self.test_pg_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                return self.log_test("Update PG Listing", True)
            else:
                return self.log_test("Update PG Listing", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Update PG Listing", False, str(e))

    def test_get_owner_listings(self):
        """Test getting owner's listings"""
        if not self.owner_token:
            return self.log_test("Get Owner Listings", False, "No owner token available")
            
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.get(f"{self.api_url}/pgs/owner/my-listings", headers=headers)
            if response.status_code == 200:
                data = response.json()
                return self.log_test("Get Owner Listings", True, f"Found {len(data)} listings")
            else:
                return self.log_test("Get Owner Listings", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Owner Listings", False, str(e))

    def test_create_inquiry(self):
        """Test creating inquiry"""
        if not self.seeker_token or not self.test_pg_id:
            return self.log_test("Create Inquiry", False, "Missing seeker token or PG ID")
            
        inquiry_data = {
            "pg_id": self.test_pg_id,
            "message": "Hi, I'm interested in this PG. Can I visit tomorrow?",
            "preferred_date": "2024-02-15"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.seeker_token}"}
            response = requests.post(f"{self.api_url}/inquiries", json=inquiry_data, headers=headers)
            if response.status_code == 200:
                return self.log_test("Create Inquiry", True)
            else:
                return self.log_test("Create Inquiry", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Create Inquiry", False, str(e))

    def test_get_user_inquiries(self):
        """Test getting user's inquiries"""
        if not self.seeker_token:
            return self.log_test("Get User Inquiries", False, "No seeker token available")
            
        try:
            headers = {"Authorization": f"Bearer {self.seeker_token}"}
            response = requests.get(f"{self.api_url}/inquiries/my-inquiries", headers=headers)
            if response.status_code == 200:
                data = response.json()
                return self.log_test("Get User Inquiries", True, f"Found {len(data)} inquiries")
            else:
                return self.log_test("Get User Inquiries", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get User Inquiries", False, str(e))

    def test_get_received_inquiries(self):
        """Test getting received inquiries (owner)"""
        if not self.owner_token:
            return self.log_test("Get Received Inquiries", False, "No owner token available")
            
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.get(f"{self.api_url}/inquiries/received", headers=headers)
            if response.status_code == 200:
                data = response.json()
                return self.log_test("Get Received Inquiries", True, f"Found {len(data)} inquiries")
            else:
                return self.log_test("Get Received Inquiries", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Received Inquiries", False, str(e))

    def test_create_review(self):
        """Test creating review"""
        if not self.seeker_token or not self.test_pg_id:
            return self.log_test("Create Review", False, "Missing seeker token or PG ID")
            
        review_data = {
            "pg_id": self.test_pg_id,
            "rating": 4,
            "comment": "Great PG with good amenities. Highly recommended!",
            "stay_duration": "6 months"
        }
        
        try:
            headers = {"Authorization": f"Bearer {self.seeker_token}"}
            response = requests.post(f"{self.api_url}/reviews", json=review_data, headers=headers)
            if response.status_code == 200:
                return self.log_test("Create Review", True)
            else:
                return self.log_test("Create Review", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Create Review", False, str(e))

    def test_get_reviews(self):
        """Test getting reviews for a PG"""
        if not self.test_pg_id:
            return self.log_test("Get Reviews", False, "No test PG ID available")
            
        try:
            response = requests.get(f"{self.api_url}/reviews/{self.test_pg_id}")
            if response.status_code == 200:
                data = response.json()
                return self.log_test("Get Reviews", True, f"Found {len(data)} reviews")
            else:
                return self.log_test("Get Reviews", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Reviews", False, str(e))

    def test_delete_pg_listing(self):
        """Test deleting PG listing (should be last test)"""
        if not self.owner_token or not self.test_pg_id:
            return self.log_test("Delete PG Listing", False, "Missing owner token or PG ID")
            
        try:
            headers = {"Authorization": f"Bearer {self.owner_token}"}
            response = requests.delete(f"{self.api_url}/pgs/{self.test_pg_id}", headers=headers)
            if response.status_code == 200:
                return self.log_test("Delete PG Listing", True)
            else:
                return self.log_test("Delete PG Listing", False, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Delete PG Listing", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting PG Finder API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)

        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        self.test_user_login()
        self.test_get_user_profile()

        # PG CRUD tests
        self.test_create_pg_listing()
        self.test_get_all_pgs()
        self.test_search_pgs_with_filters()
        self.test_get_pg_details()
        self.test_update_pg_listing()
        self.test_get_owner_listings()

        # Inquiry tests
        self.test_create_inquiry()
        self.test_get_user_inquiries()
        self.test_get_received_inquiries()

        # Review tests
        self.test_create_review()
        self.test_get_reviews()

        # Cleanup
        self.test_delete_pg_listing()

        # Print results
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = PGFinderAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())