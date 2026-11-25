import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/server/auth/auth-middleware';
import { createCustomerAddress, getCustomerAddresses } from '@/server/customer/customer-service';
import { apiSuccess, handleApiError, readJsonBody, ValidationError } from '@/server/security/http';

export const dynamic = 'force-dynamic';

const AddressPayloadSchema = z.object({
  label: z.enum(['home', 'work', 'other']).default('home'),
  fullName: z.string().min(2),
  streetAddress: z.string().min(5),
  streetAddress2: z.string().optional(),
  city: z.string().min(2),
  stateOrProvince: z.string().min(2),
  postalCode: z.string().min(3),
  countryCode: z.string().min(2).max(8),
  phoneNumber: z.string().min(6),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const addresses = await getCustomerAddresses(auth.customer.id);
    return apiSuccess(addresses, { meta: { total: addresses.length } });
  } catch (error) {
    return handleApiError(request, error, 'GET /api/customer/addresses');
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    const body = await readJsonBody(request, 16384);
    const parsed = AddressPayloadSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError('Invalid address payload', parsed.error.flatten().fieldErrors);
    }

    const created = await createCustomerAddress(auth.customer.id, parsed.data);
    return apiSuccess(created, { status: 201 });
  } catch (error) {
    return handleApiError(request, error, 'POST /api/customer/addresses');
  }
}
