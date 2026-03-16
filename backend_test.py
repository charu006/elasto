import requests
import sys
import json
from datetime import datetime

class ElastoAITester:
    def __init__(self, base_url="http://localhost:8000/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for file uploads
                    headers.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {test_user['email']}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        # First register a user
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "name": f"Login Test User {timestamp}",
            "email": f"login{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        # Register
        reg_success, reg_response = self.run_test(
            "Register for Login Test",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if not reg_success:
            return False
            
        # Now test login
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            return True
        return False

    def test_get_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_chat(self):
        """Test chat functionality"""
        chat_data = {
            "message": "What is EPDM rubber used for?",
            "language": "en"
        }
        
        success, response = self.run_test(
            "Chat Message",
            "POST",
            "chat",
            200,
            data=chat_data
        )
        
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   Chat response: {response['response'][:100]}...")
            return True
        return False

    def test_chat_history(self):
        """Test chat history retrieval"""
        success, response = self.run_test(
            "Get Chat History",
            "GET",
            "chat-history",
            200
        )
        return success

    def test_formulation_prediction(self):
        """Test formulation prediction"""
        formulation_data = {
            "hardness_shore_a": 65,
            "tensile_strength_mpa": 15.0,
            "elongation_percent": 400,
            "elastomer_type": "EPDM",
            "application": "automotive seals"
        }
        
        success, response = self.run_test(
            "Formulation Prediction",
            "POST",
            "predict-formulation",
            200,
            data=formulation_data
        )
        
        if success and 'formulation' in response:
            print(f"   Formulation response: {response['formulation'][:100]}...")
            return True
        return False

    def test_knowledge_base(self):
        """Test knowledge base operations"""
        # Add knowledge entry
        knowledge_data = {
            "title": "Test EPDM Formulation",
            "content": "EPDM with sulfur cure system for automotive applications",
            "category": "formulation",
            "tags": ["EPDM", "automotive", "sulfur"]
        }
        
        success, response = self.run_test(
            "Add Knowledge Entry",
            "POST",
            "knowledge",
            200,
            data=knowledge_data
        )
        
        if not success:
            return False
            
        # Get knowledge entries
        success, response = self.run_test(
            "Get Knowledge Entries",
            "GET",
            "knowledge",
            200
        )
        
        return success

    def test_documents_endpoint(self):
        """Test documents endpoint (without actual file upload)"""
        success, response = self.run_test(
            "Get Documents",
            "GET",
            "documents",
            200
        )
        return success

    def test_formulation_history(self):
        """Test formulation history"""
        success, response = self.run_test(
            "Get Formulation History",
            "GET",
            "formulation-history",
            200
        )
        return success

def main():
    print("🧪 Starting ElastoAI Backend API Tests")
    print("=" * 50)
    
    tester = ElastoAITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Chat Functionality", tester.test_chat),
        ("Chat History", tester.test_chat_history),
        ("Formulation Prediction", tester.test_formulation_prediction),
        ("Knowledge Base", tester.test_knowledge_base),
        ("Documents Endpoint", tester.test_documents_endpoint),
        ("Formulation History", tester.test_formulation_history),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
         print("LLM ERROR:", e)
        return "I couldn't generate a response right now."
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All backend tests passed!")
        return 0
    else:
        print("⚠️  Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())