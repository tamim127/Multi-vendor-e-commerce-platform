import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminPermission } from '@/server/auth/auth-middleware';
import { listAdminCustomers, moderateCustomer } from '@/server/admin/admin-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const ModerateCustomerSchema = z.object({
  customerId: z.string().min(2),
  status: z.enum(['active', 'suspended', 'locked']),
  note: z.string().optional(),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    await requireAdminPermission(request, 'customers:read');
    const customers = await listAdminCustomers();
    return apiSuccess(customers, { meta: { total: customers.length } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/admin/customers');
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAdminPermission(request, 'customers:moderate');
    const body = await readJsonBody(request, 16384);
    const parsed = ModerateCustomerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Invalid customer moderation payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await moderateCustomer({
      ...parsed.data,
      actorId: auth.customer.id,
      actorName: `${auth.customer.firstName} ${auth.customer.lastName}`,
      actorRole: auth.customer.adminRole || 'admin',
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/admin/customers');
  }
}
