/**
 * Server-side services index
 *
 * This module exports all server-side services for easy importing.
 * Server-side services handle SSR, API endpoints, and server-specific functionality.
 */

// Remote functions for database-driven app registry
export { getUserApps, getUserAppsByCategory, searchUserApps } from './appRegistry.remote';

// Remote functions for user permissions
export { getUserPermissions } from './permissions.remote';
