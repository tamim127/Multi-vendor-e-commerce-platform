import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { deleteCustomerAddress, updateCustomerAddress } from '@/server/customer/customer-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const AddressPatchSchema = z.object({
  label: z.enum(['home', 'work', 'other']).optional(),
  fullName: z.string().min(2).optional(),
  streetAddress: z.string().min(5).optional(),
  streetAddress2: z.string().optional(),
  city: z.string().min(2).optional(),
  stateOrProvince: z.string().min(2).optional(),
  postalCode: z.string().min(3).optional(),
  countryCode: z.string().min(2).max(8).optional(),
  phoneNumber: z.string().min(6).optional(),
  isDefaultShipping: z.boolean().optional(),
  isDefaultBilling: z.boolean().optional(),
});

export async function PATCH(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    const body = await readJsonBody(request, 16384);
    const parsed = AddressPatchSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid address update payload', parsed.error.flatten().fieldErrors);
    }

    const updated = await updateCustomerAddress(auth.customer.id, id, parsed.data);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(request, error, 'PATCH /api/customer/addresses/[id]');
  }
}

export async function DELETE(request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const { id } = await context.params;
    await deleteCustomerAddress(auth.customer.id, id);
    return apiSuccess({ deleted: true, id });
  } catch (error) {
    return handleApiError(request, error, 'DELETE /api/customer/addresses/[id]');
  }
}
