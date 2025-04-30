// Minimal implementation for local auth operations
// No logging or mocking - just functional stubs that work for localhost

/**
 * Create a new user in the identity provider
 */
export async function createUser(userData) {
  // No-op for localhost
  return { success: true };
}

/**
 * Get a user from the identity provider
 */
export async function getUser(username) {
  // Return null to use local auth only
  return null;
}

/**
 * Initiate an authentication flow
 */
export async function initiateAuthentication(username) {
  // Return empty flow for localhost
  return { success: true };
}

/**
 * Complete an authentication flow
 */
export async function completeAuthentication(flowId, userId, isPatternValid) {
  // No-op for localhost
  return { success: isPatternValid };
}

/**
 * Store a user's pattern
 */
export async function storePattern(userId, encodedPattern) {
  // No-op for localhost
  return { success: true };
}

/**
 * Retrieve a user's pattern
 */
export async function getPattern(userId) {
  // Always return null to use local pattern
  return null;
}

/**
 * Get the name of the active identity provider
 */
export function getProviderName() {
  return 'LocalAuth';
}

/**
 * Check if fallback to local auth is being used
 */
export function isUsingLocalFallback() {
  return true;
}