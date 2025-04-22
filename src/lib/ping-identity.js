import axios from 'axios';

// PingOne Environment Configuration
const PING_ONE_AUTH_URL = process.env.PING_ONE_AUTH_URL || 'https://auth.pingone.com';
const PING_ONE_API_URL = process.env.PING_ONE_API_URL || 'https://api.pingone.com/v1';
const PING_ONE_ENV_ID = process.env.PING_ONE_ENV_ID;
const PING_ONE_CLIENT_ID = process.env.PING_ONE_CLIENT_ID;
const PING_ONE_CLIENT_SECRET = process.env.PING_ONE_CLIENT_SECRET;

// In-memory token cache with expiration
let accessToken = null;
let tokenExpiration = null;

/**
 * Get an access token for PingOne API calls
 */
async function getAccessToken() {
  // If we have a valid token, return it
  if (accessToken && tokenExpiration && tokenExpiration > Date.now()) {
    return accessToken;
  }
  
  try {
    const response = await axios.post(
      `${PING_ONE_AUTH_URL}/${PING_ONE_ENV_ID}/as/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PING_ONE_CLIENT_ID,
        client_secret: PING_ONE_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    // Set token and expiration
    accessToken = response.data.access_token;
    // Set expiration 5 minutes before actual expiry
    tokenExpiration = Date.now() + (response.data.expires_in - 300) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting PingOne access token:', error);
    throw new Error('Failed to authenticate with PingOne');
  }
}

/**
 * Create a new user in PingOne
 */
export async function createPingOneUser(userData) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.post(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/users`,
      {
        username: userData.username,
        email: userData.email,
        name: {
          given: userData.firstName || userData.username,
          family: userData.lastName || ''
        },
        // Additional data for our custom pattern attribute
        customAttribute: {
          patternAuthEnabled: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating PingOne user:', error);
    throw new Error('Failed to create user in PingOne');
  }
}

/**
 * Get a user from PingOne
 */
export async function getPingOneUser(username) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/users?filter=username eq "${username}"`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data._embedded && response.data._embedded.users.length > 0) {
      return response.data._embedded.users[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting PingOne user:', error);
    throw new Error('Failed to get user from PingOne');
  }
}

/**
 * Initiate a PingOne Flow for custom authentication
 */
export async function initiateAuthenticationFlow(username) {
  try {
    const token = await getAccessToken();
    
    // Get the user first
    const user = await getPingOneUser(username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create a new PingOne flow for this authentication
    const response = await axios.post(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/flows`,
      {
        type: 'AUTHENTICATION',
        userId: user.id,
        customData: {
          authType: 'patternAuth',
          flowStatus: 'INITIATED'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      flowId: response.data.id,
      userId: user.id
    };
  } catch (error) {
    console.error('Error initiating PingOne flow:', error);
    throw new Error('Failed to initiate authentication flow');
  }
}

/**
 * Complete a PingOne pattern authentication flow
 */
export async function completePatternAuthentication(flowId, userId, isPatternValid) {
  try {
    const token = await getAccessToken();
    
    // Update the flow status based on pattern verification
    const flowStatus = isPatternValid ? 'COMPLETED' : 'FAILED';
    
    const response = await axios.patch(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/flows/${flowId}`,
      {
        customData: {
          flowStatus,
          patternVerified: isPatternValid,
          completedAt: new Date().toISOString()
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      flowId: response.data.id,
      status: flowStatus,
      patternVerified: isPatternValid
    };
  } catch (error) {
    console.error('Error completing PingOne flow:', error);
    throw new Error('Failed to complete authentication flow');
  }
}

/**
 * Store a user's pattern in PingOne
 */
export async function storeUserPattern(userId, encodedPattern) {
  try {
    const token = await getAccessToken();
    
    // Update user with pattern data (in a real implementation, this would be encrypted)
    const response = await axios.patch(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/users/${userId}`,
      {
        customAttribute: {
          patternAuthEnabled: true,
          patternData: encodedPattern
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error storing user pattern:', error);
    throw new Error('Failed to store user pattern');
  }
}

/**
 * Retrieve a user's pattern from PingOne
 */
export async function getUserPattern(userId) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${PING_ONE_API_URL}/environments/${PING_ONE_ENV_ID}/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data.customAttribute && response.data.customAttribute.patternData) {
      return response.data.customAttribute.patternData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user pattern:', error);
    throw new Error('Failed to get user pattern');
  }
}