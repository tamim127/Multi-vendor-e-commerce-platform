import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { getPlatformSettings, updatePlatformSettings } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const SettingsPatchSchema = z.object({
  marketplaceName: z.string().min(2).max(255).optional(),
  supportEmail: z.string().email().optional(),
  defaultCurrency: z.enum(['USD', 'EUR', 'GBP', 'BDT', 'AED', 'SAR']).optional(),
  platformCommissionBps: z.number().int().min(0).max(5000).optional(),
  maintenanceMode: z.boolean().optional(),
  allowSellerRegistrations: z.boolean().optional(),
  requireProductModeration: z.boolean().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'settings:read');
    const settings = await getPlatformSettings();
    return apiSuccess(settings);
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/settings');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'settings:write');
    const body = await readJsonBody(request, 16384);
    const parsed = SettingsPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid settings payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await updatePlatformSettings(
      auth.customer.id,
      `${auth.customer.firstName} ${auth.customer.lastName}`,
      auth.customer.adminRole || 'admin',
      parsed.data
    );
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/settings');
  }
}
