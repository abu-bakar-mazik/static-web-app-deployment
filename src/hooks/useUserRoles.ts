import { useSelector } from 'react-redux';
import { selectUserRoles } from '@/redux/slices/authSlice';

/**
 * Custom hook for managing user roles and role-based functionality
 */
export const useUserRoles = () => {
  const userRoles = useSelector(selectUserRoles);

  /**
   * Check if user has a specific role
   * @param role - Role to check for
   * @returns boolean indicating if user has the role
   */
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  /**
   * Check if user has any of the specified roles
   * @param roles - Array of roles to check for
   * @returns boolean indicating if user has any of the roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  /**
   * Check if user has all of the specified roles
   * @param roles - Array of roles to check for
   * @returns boolean indicating if user has all of the roles
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => userRoles.includes(role));
  };

  /**
   * Check if user is an admin (has 'admin' role)
   * @returns boolean indicating if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  /**
   * Get all user roles
   * @returns array of user roles
   */
  const getRoles = (): string[] => {
    return [...userRoles];
  };

  return {
    userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    getRoles
  };
};
