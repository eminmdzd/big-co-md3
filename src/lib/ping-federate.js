import axios from 'axios';

// PingFederate Configuration
const PING_FED_BASE_URL = process.env.PING_FED_BASE_URL || 'https://pingfederate.example.com';
const PING_FED_CLIENT_ID = process.env.PING_FED_CLIENT_ID;
const PING_FED_CLIENT_SECRET = process.env.PING_FED_CLIENT_SECRET;
const PING_FED_AUTH_PATH = process.env.PING_FED_AUTH_PATH || '/as/token.oauth2';
const PING_FED_API_PATH = process.env.PING_FED_API_PATH || '/pf-admin/api/v1';

// In-memory token cache with expiration
let accessToken = null;
let tokenExpiration = null;

/**
 * Get an access token for PingFederate API calls
 */
async function getAccessToken() {
  // If we have a valid token, return it
  if (accessToken && tokenExpiration && tokenExpiration > Date.now()) {
    return accessToken;
  }
  
  try {
    const response = await axios.post(
      `${PING_FED_BASE_URL}${PING_FED_AUTH_PATH}`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PING_FED_CLIENT_ID,
        client_secret: PING_FED_CLIENT_SECRET,
        scope: 'administrator'
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
    console.error('Error getting PingFederate access token:', error);
    throw new Error('Failed to authenticate with PingFederate');
  }
}

/**
 * Create a new user in PingFederate (using PD adapter or API)
 */
export async function createPingFedUser(userData) {
  try {
    const token = await getAccessToken();
    
    // This would call a specific user management API endpoint
    // Note: Actual implementation depends on your PingFederate setup
    const response = await axios.post(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/users`,
      {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || userData.username,
        lastName: userData.lastName || '',
        attributes: {
          patternAuthEnabled: "true"
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
    console.error('Error creating PingFederate user:', error);
    throw new Error('Failed to create user in PingFederate');
  }
}

/**
 * Get a user from PingFederate
 */
export async function getPingFedUser(username) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/users`,
      {
        params: {
          filter: `username eq "${username}"`
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting PingFederate user:', error);
    throw new Error('Failed to get user from PingFederate');
  }
}

/**
 * Initiate a pattern authentication flow
 */
export async function initiatePatternAuthentication(username) {
  try {
    const token = await getAccessToken();
    
    // Get the user first
    const user = await getPingFedUser(username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create a record of the authentication flow (you would use a real auth flow API here)
    const response = await axios.post(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/authenticationFlows`,
      {
        type: 'PATTERN_AUTH',
        userId: user.id,
        status: 'INITIATED',
        createdAt: new Date().toISOString()
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
    console.error('Error initiating pattern authentication:', error);
    throw new Error('Failed to initiate pattern authentication');
  }
}

/**
 * Complete a pattern authentication flow
 */
export async function completePatternAuthentication(flowId, userId, isPatternValid) {
  try {
    const token = await getAccessToken();
    
    // Update the flow status based on pattern verification
    const status = isPatternValid ? 'COMPLETED' : 'FAILED';
    
    const response = await axios.patch(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/authenticationFlows/${flowId}`,
      {
        status,
        patternVerified: isPatternValid,
        completedAt: new Date().toISOString()
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
      status,
      patternVerified: isPatternValid
    };
  } catch (error) {
    console.error('Error completing pattern authentication:', error);
    throw new Error('Failed to complete pattern authentication');
  }
}

/**
 * Store a user's pattern
 */
export async function storeUserPattern(userId, encodedPattern) {
  try {
    const token = await getAccessToken();
    
    // Update user with pattern data (in a real implementation, this would be encrypted)
    const response = await axios.patch(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/users/${userId}`,
      {
        attributes: {
          patternAuthEnabled: "true",
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
 * Retrieve a user's pattern
 */
export async function getUserPattern(userId) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${PING_FED_BASE_URL}${PING_FED_API_PATH}/users/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data.attributes && response.data.attributes.patternData) {
      return response.data.attributes.patternData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user pattern:', error);
    throw new Error('Failed to get user pattern');
  }
}

/**
 * Handle fallback to local authentication when PingFederate is unavailable
 * Returns true for success, or an error message
 */
export async function handleFallback(action, ...params) {
  try {
    // Try to perform the action with PingFederate
    return await action(...params);
  } catch (error) {
    console.warn(`PingFederate ${action.name} failed, falling back to local auth:`, error.message);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}