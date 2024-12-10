from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

User = get_user_model()

class AuthTests(APITestCase):
    def setUp(self):
        # Create users for testing
        self.alice = User.objects.create_user(
            name='Alice Smith',
            email='alice.smith@example.com',
            password='password1'
        )
        
    def test_obtain_token(self):
        response = self.client.post('/api/token/', {
            'email': 'alice.smith@example.com',
            'password': 'password1'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        
    def test_access_protected_endpoint(self):
        # Get token
        token_res = self.client.post('/api/token/', {
            'email': 'alice.smith@example.com',
            'password': 'password1'
        }, format='json')
        
        access_token = token_res.data['access']

        # Use token to access protected endpoint
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access_token)
        me_res = self.client.get('/api/users/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['email'], 'alice.smith@example.com')
