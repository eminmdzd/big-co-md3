// This file serves as a façade for identity provider operations,
// selecting either PingOne or PingFederate based on configuration

import * as PingOne from './ping-identity';
import * as PingFederate from './ping-federate';

// Check which identity provider to use
const usePingFederate = process.env.USE_PING_FEDERATE === 'true';
const identityProvider = usePingFederate ? PingFederate : PingOne;

/**
 * Create a new user in the identity provider
 */
export async function createUser(userData) {
  try {
    if (usePingFederate) {
      return await PingFederate.createPingFedUser(userData);
    } else {
      return await PingOne.createPingOneUser(userData);
    }
  } catch (error) {
    console.warn('Identity provider user creation failed, falling back to local auth:', error.message);
    return { success: false, error: error.message, fallback: true };
  }
}

/**
 * Get a user from the identity provider
 */
export async function getUser(username) {
  try {
    if (usePingFederate) {
      return await PingFederate.getPingFedUser(username);
    } else {
      return await PingOne.getPingOneUser(username);
    }
  } catch (error) {
    console.warn('Identity provider user lookup failed, falling back to local auth:', error.message);
    return null;
  }
}

/**
 * Initiate an authentication flow
 */
export async function initiateAuthentication(username) {
  try {
    if (usePingFederate) {
      return await PingFederate.initiatePatternAuthentication(username);
    } else {
      return await PingOne.initiateAuthenticationFlow(username);
    }
  } catch (error) {
    console.warn('Identity provider auth flow initiation failed, falling back to local auth:', error.message);
    return { success: false, error: error.message, fallback: true };
  }
}

/**
 * Complete an authentication flow
 */
export async function completeAuthentication(flowId, userId, isPatternValid) {
  try {
    if (usePingFederate) {
      return await PingFederate.completePatternAuthentication(flowId, userId, isPatternValid);
    } else {
      return await PingOne.completePatternAuthentication(flowId, userId, isPatternValid);
    }
  } catch (error) {
    console.warn('Identity provider auth flow completion failed, falling back to local auth:', error.message);
    return { success: false, error: error.message, fallback: true };
  }
}

/**
 * Store a user's pattern
 */
export async function storePattern(userId, encodedPattern) {
  try {
    if (usePingFederate) {
      return await PingFederate.storeUserPattern(userId, encodedPattern);
    } else {
      return await PingOne.storeUserPattern(userId, encodedPattern);
    }
  } catch (error) {
    console.warn('Identity provider pattern storage failed, falling back to local auth:', error.message);
    return { success: false, error: error.message, fallback: true };
  }
}

/**
 * Retrieve a user's pattern
 */
export async function getPattern(userId) {
  try {
    if (usePingFederate) {
      return await PingFederate.getUserPattern(userId);
    } else {
      return await PingOne.getUserPattern(userId);
    }
  } catch (error) {
    console.warn('Identity provider pattern retrieval failed, falling back to local auth:', error.message);
    return null;
  }
}

/**
 * Get the name of the active identity provider
 */
export function getProviderName() {
  return usePingFederate ? 'PingFederate' : 'PingOne';
}

/**
 * Check if fallback to local auth is being used
 */
export function isUsingLocalFallback() {
  return !process.env.PING_ONE_ENV_ID && !process.env.PING_FED_BASE_URL;
}