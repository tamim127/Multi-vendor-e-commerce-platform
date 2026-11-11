/**
 * ==============================================================================
 * ADMIN DOMAIN — RBAC & AUTHORIZATION UNIT TESTS
 * ==============================================================================
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  DEMO_SUPER_ADMIN,
  DEMO_CATALOG_MANAGER,
  DEMO_ORDER_MANAGER,
  DEMO_SUPPORT_LEAD,
  DEMO_FINANCE_MANAGER,
  DEMO_COMPLIANCE_OFFICER,
} from '@/domains/admin';
import {
  calculateCommissionMinor,
  formatMinorToCurrency,
  computeSummaryKPIs,
} from '@/domains/admin/utils/analytics';

describe('Admin Domain — RBAC & Authorization', () => {
  describe('Fail-Closed Permission Evaluation', () => {
    it('fails closed when user is null or undefined', () => {
      expect(hasPermission(null, 'sellers:read')).toBe(false);
      expect(hasPermission(undefined, 'catalog:read')).toBe(false);
      expect(hasAnyPermission(null, ['orders:read', 'orders:write'])).toBe(false);
      expect(hasAllPermissions(null, ['settings:read'])).toBe(false);
    });

    it('fails closed when user is deactivated', () => {
      const inactiveUser = { ...DEMO_SUPER_ADMIN, isActive: false };
      expect(hasPermission(inactiveUser, 'sellers:read')).toBe(false);
      expect(hasAnyPermission(inactiveUser, ['sellers:read'])).toBe(false);
    });

    it('grants unconstrained access to super_admin', () => {
      expect(hasPermission(DEMO_SUPER_ADMIN, 'sellers:moderate')).toBe(true);
      expect(hasPermission(DEMO_SUPER_ADMIN, 'settings:write')).toBe(true);
      expect(hasPermission(DEMO_SUPER_ADMIN, 'audit_logs:read')).toBe(true);
    });

    it('enforces least-privilege boundary for catalog_manager', () => {
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'catalog:read')).toBe(true);
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'catalog:moderate')).toBe(true);
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'reviews:moderate')).toBe(true);

      // Forbidden for catalog manager
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'sellers:moderate')).toBe(false);
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'refunds:process')).toBe(false);
      expect(hasPermission(DEMO_CATALOG_MANAGER, 'settings:write')).toBe(false);
    });

    it('enforces least-privilege boundary for order_manager', () => {
      expect(hasPermission(DEMO_ORDER_MANAGER, 'orders:read')).toBe(true);
      expect(hasPermission(DEMO_ORDER_MANAGER, 'orders:override')).toBe(true);
      expect(hasPermission(DEMO_ORDER_MANAGER, 'refunds:read')).toBe(true);

      // Forbidden for order manager
      expect(hasPermission(DEMO_ORDER_MANAGER, 'catalog:write')).toBe(false);
      expect(hasPermission(DEMO_ORDER_MANAGER, 'settings:write')).toBe(false);
    });

    it('enforces least-privilege boundary for support_lead', () => {
      expect(hasPermission(DEMO_SUPPORT_LEAD, 'customers:read')).toBe(true);
      expect(hasPermission(DEMO_SUPPORT_LEAD, 'customers:moderate')).toBe(true);
      expect(hasPermission(DEMO_SUPPORT_LEAD, 'reviews:moderate')).toBe(true);

      // Forbidden
      expect(hasPermission(DEMO_SUPPORT_LEAD, 'settings:write')).toBe(false);
      expect(hasPermission(DEMO_SUPPORT_LEAD, 'sellers:write')).toBe(false);
    });

    it('enforces least-privilege boundary for finance_manager', () => {
      expect(hasPermission(DEMO_FINANCE_MANAGER, 'analytics:read')).toBe(true);
      expect(hasPermission(DEMO_FINANCE_MANAGER, 'refunds:process')).toBe(true);
      expect(hasPermission(DEMO_FINANCE_MANAGER, 'promotions:write')).toBe(true);

      // Forbidden
      expect(hasPermission(DEMO_FINANCE_MANAGER, 'catalog:moderate')).toBe(false);
    });

    it('enforces least-privilege boundary for compliance_officer', () => {
      expect(hasPermission(DEMO_COMPLIANCE_OFFICER, 'audit_logs:read')).toBe(true);
      expect(hasPermission(DEMO_COMPLIANCE_OFFICER, 'sellers:moderate')).toBe(true);

      // Forbidden
      expect(hasPermission(DEMO_COMPLIANCE_OFFICER, 'refunds:process')).toBe(false);
      expect(hasPermission(DEMO_COMPLIANCE_OFFICER, 'catalog:write')).toBe(false);
    });
  });

  describe('Multi-Permission Checking', () => {
    it('evaluates hasAnyPermission correctly', () => {
      expect(hasAnyPermission(DEMO_CATALOG_MANAGER, ['sellers:write', 'catalog:read'])).toBe(true);
      expect(hasAnyPermission(DEMO_CATALOG_MANAGER, ['sellers:write', 'settings:write'])).toBe(
        false
      );
    });

    it('evaluates hasAllPermissions correctly', () => {
      expect(hasAllPermissions(DEMO_CATALOG_MANAGER, ['catalog:read', 'catalog:moderate'])).toBe(
        true
      );
      expect(hasAllPermissions(DEMO_CATALOG_MANAGER, ['catalog:read', 'sellers:moderate'])).toBe(
        false
      );
    });

    it('returns declared role permissions list', () => {
      const perms = getRolePermissions('support_lead');
      expect(perms).toContain('customers:moderate');
      expect(perms).not.toContain('settings:write');
    });
  });

  describe('Financial Analytics Calculations', () => {
    it('calculates platform commission correctly in integer minor units', () => {
      // 10% of $100.00 (10000 minor units) = 1000 minor units
      expect(calculateCommissionMinor(10000, 10)).toBe(1000);
      // 12.5% of $250.00 (25000 minor units) = 3125 minor units
      expect(calculateCommissionMinor(25000, 12.5)).toBe(3125);
    });

    it('formats minor units to currency string safely', () => {
      expect(formatMinorToCurrency(1250, 'USD')).toBe('$12.50');
      expect(formatMinorToCurrency(0, 'USD')).toBe('$0.00');
    });

    it('computes summary KPIs from chart data points', () => {
      const points = [
        { date: '2026-02-19', gmvMinor: 10000, netRevenueMinor: 1250, ordersCount: 2 },
        { date: '2026-02-20', gmvMinor: 20000, netRevenueMinor: 2500, ordersCount: 2 },
      ];
      const summary = computeSummaryKPIs(points, 12.5, 'USD');

      expect(summary.totalGmv?.amountMinor).toBe(30000);
      expect(summary.totalOrders).toBe(4);
      expect(summary.platformCommission?.amountMinor).toBe(3750);
      expect(summary.averageOrderValue?.amountMinor).toBe(7500); // 30000 / 4
    });
  });
});
