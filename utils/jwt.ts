import { Roles } from '../lib/api/services/fetchAuth';

export interface TokenRole {
  id: number;
  name: string;
  createdById: string | null;
  updatedById: string | null;
  deletedById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DecodedToken {
  userId: number;
  deviceId?: number;
  roles: TokenRole[];
  providerId?: number;
  uuid: string;
  iat: number;
  exp: number;
}

export const hasRole = (token: DecodedToken, roleName: string): boolean => {
  if (!token?.roles || !Array.isArray(token.roles)) {
    return false;
  }

  const hasMatchingRole = token.roles.some(role => role.name === roleName);
  return hasMatchingRole;
};

export const isServiceProvider = (token: DecodedToken | null): boolean => {
  if (!token) return false;
  const result = hasRole(token, Roles.SERVICE_PROVIDER);
  return result;
};

export const isCustomer = (token: DecodedToken | null): boolean => {
  if (!token) return false;
  const result = hasRole(token, Roles.CUSTOMER);
  return result;
};

export const isAdmin = (token: DecodedToken | null): boolean => {
  if (!token) return false;
  const result = hasRole(token, Roles.Admin);
  return result;
};

export const isManager = (token: DecodedToken | null): boolean => {
  if (!token) return false;
  const result = hasRole(token, Roles.MANAGER);
  return result;
};

export function decodeJwt(token: string): DecodedToken | null {
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('[JWT] Invalid JWT format');
      return null;
    }

    // Base64Url decode the payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload) as DecodedToken;

    return decoded;
  } catch (error) {
    console.error('[JWT] Error decoding JWT:', error);
    return null;
  }
}
