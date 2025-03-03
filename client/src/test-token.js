// Test script to verify token storage and retrieval
// Run this in the browser console

// Function to test token storage
function testTokenStorage() {
  console.log('=== TOKEN STORAGE TEST ===');
  
  // Clear any existing token
  localStorage.removeItem('adminToken');
  console.log('Cleared existing token');
  
  // Test token
  const testToken = 'test_token_' + Date.now();
  console.log('Test token:', testToken);
  
  // Store token
  localStorage.setItem('adminToken', testToken);
  console.log('Stored token in localStorage');
  
  // Retrieve token
  const retrievedToken = localStorage.getItem('adminToken');
  console.log('Retrieved token:', retrievedToken);
  
  // Verify token
  if (retrievedToken === testToken) {
    console.log('✅ SUCCESS: Token storage and retrieval working correctly');
  } else {
    console.error('❌ ERROR: Token storage and retrieval not working correctly');
    console.error('Expected:', testToken);
    console.error('Actual:', retrievedToken);
  }
  
  // Clean up
  localStorage.removeItem('adminToken');
  console.log('Cleaned up test token');
  
  console.log('=== TEST COMPLETE ===');
}

// Function to test token from login response
function testLoginResponseToken(response) {
  console.log('=== LOGIN RESPONSE TOKEN TEST ===');
  console.log('Full response:', response);
  
  if (!response) {
    console.error('❌ ERROR: No response provided');
    return;
  }
  
  console.log('Response type:', typeof response);
  
  if (typeof response === 'string') {
    try {
      response = JSON.parse(response);
      console.log('Parsed response:', response);
    } catch (e) {
      console.error('❌ ERROR: Could not parse response as JSON:', e);
      return;
    }
  }
  
  // Check response structure
  console.log('Response has data property:', response.hasOwnProperty('data'));
  
  if (response.data) {
    console.log('Response.data type:', typeof response.data);
    console.log('Response.data has token property:', response.data.hasOwnProperty('token'));
    
    if (response.data.token) {
      console.log('Token value:', response.data.token);
      console.log('✅ SUCCESS: Token found in response');
      
      // Store token
      localStorage.setItem('adminToken', response.data.token);
      console.log('Stored token in localStorage');
      
      // Verify storage
      const storedToken = localStorage.getItem('adminToken');
      console.log('Verified stored token:', storedToken);
      
      if (storedToken === response.data.token) {
        console.log('✅ SUCCESS: Token stored correctly');
      } else {
        console.error('❌ ERROR: Token not stored correctly');
      }
    } else {
      console.error('❌ ERROR: No token property in response.data');
    }
  } else {
    console.error('❌ ERROR: No data property in response');
  }
  
  console.log('=== TEST COMPLETE ===');
}

// Export functions for use in browser console
window.testTokenStorage = testTokenStorage;
window.testLoginResponseToken = testLoginResponseToken;

console.log('Token test functions loaded. Run testTokenStorage() to test localStorage functionality.');
console.log('After login, run testLoginResponseToken(response) with the login response to test token extraction.'); 