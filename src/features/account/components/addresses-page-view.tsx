/**
 * ==============================================================================
 * ACCOUNT FEATURE — ADDRESS BOOK PAGE VIEW
 * ==============================================================================
 * Manages customer saved shipping & billing addresses with full CRUD & validation.
 */

'use client';

import * as React from 'react';
import { useAuth } from '@/features/auth';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button/button';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Star,
  Home,
  Briefcase,
  Globe,
  X,
} from 'lucide-react';
import type {
  CustomerAddress,
  AddressUpsertInput,
  AddressLabel,
} from '@/domains/customer/types/address';
import { AddressUpsertSchema } from '@/domains/customer/schemas';

export function AddressesPageView(): React.JSX.Element {
  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultShippingAddress,
    setDefaultBillingAddress,
  } = useAuth();
  const { t } = useI18n();

  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddress | null>(null);

  // Form State
  const [label, setLabel] = React.useState<AddressLabel>('home');
  const [fullName, setFullName] = React.useState('');
  const [streetAddress, setStreetAddress] = React.useState('');
  const [streetAddress2, setStreetAddress2] = React.useState('');
  const [city, setCity] = React.useState('');
  const [stateOrProvince, setStateOrProvince] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('US');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isDefaultShipping, setIsDefaultShipping] = React.useState(false);
  const [isDefaultBilling, setIsDefaultBilling] = React.useState(false);

  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const openAddModal = (): void => {
    setEditingAddress(null);
    setLabel('home');
    setFullName('');
    setStreetAddress('');
    setStreetAddress2('');
    setCity('');
    setStateOrProvince('');
    setPostalCode('');
    setCountryCode('US');
    setPhoneNumber('');
    setIsDefaultShipping(addresses.length === 0);
    setIsDefaultBilling(addresses.length === 0);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (addr: CustomerAddress): void => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setFullName(addr.fullName);
    setStreetAddress(addr.streetAddress);
    setStreetAddress2(addr.streetAddress2 ?? '');
    setCity(addr.city);
    setStateOrProvince(addr.stateOrProvince);
    setPostalCode(addr.postalCode);
    setCountryCode(addr.countryCode);
    setPhoneNumber(addr.phoneNumber);
    setIsDefaultShipping(addr.isDefaultShipping);
    setIsDefaultBilling(addr.isDefaultBilling);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFeedbackMessage(null);

    const payload: AddressUpsertInput = {
      label,
      fullName: fullName.trim(),
      streetAddress: streetAddress.trim(),
      streetAddress2: streetAddress2.trim() || undefined,
      city: city.trim(),
      stateOrProvince: stateOrProvince.trim(),
      postalCode: postalCode.trim(),
      countryCode: countryCode.trim().toUpperCase(),
      phoneNumber: phoneNumber.trim(),
      isDefaultShipping,
      isDefaultBilling,
    };

    const validation = AddressUpsertSchema.safeParse(payload);
    if (!validation.success) {
      const errs: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        errs[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
      } else {
        await addAddress(payload);
      }
      setIsModalOpen(false);
      setFeedbackMessage(t('addresses.addressSaved'));
    } catch (err: unknown) {
      setFieldErrors({ root: err instanceof Error ? err.message : 'Failed to save address' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-fg-primary flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <span>{t('addresses.title')}</span>
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Manage your personal delivery locations and billing profiles.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={openAddModal}
          className="font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>{t('addresses.addNew')}</span>
        </Button>
      </div>

      {feedbackMessage && (
        <div className="rounded-xl border border-success/30 bg-success/10 p-4 flex items-center gap-3 text-xs text-success font-medium animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Address Cards Grid */}
      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default bg-surface p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-fg-muted mx-auto">
            <MapPin className="size-6" />
          </div>
          <h3 className="text-base font-bold text-fg-primary">{t('addresses.noAddresses')}</h3>
          <p className="text-xs text-fg-muted max-w-sm mx-auto">{t('addresses.noAddressesDesc')}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={openAddModal}
            className="font-semibold cursor-pointer mt-2"
          >
            {t('addresses.addNew')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const LabelIcon =
              addr.label === 'home' ? Home : addr.label === 'work' ? Briefcase : Globe;

            return (
              <div
                key={addr.id}
                className="rounded-2xl border border-border-default bg-surface p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fg-muted">
                      <LabelIcon className="size-3.5 text-primary" />
                      <span>{addr.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {addr.isDefaultShipping && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-2xs font-bold text-primary border border-primary/20">
                          <Star className="size-2.5 fill-current" />
                          <span>{t('addresses.defaultShipping')}</span>
                        </span>
                      )}
                      {addr.isDefaultBilling && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-2xs font-semibold text-fg-muted border border-border-subtle">
                          <span>{t('addresses.defaultBilling')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-0.5 text-xs text-fg-muted">
                    <p className="text-sm font-bold text-fg-primary">{addr.fullName}</p>
                    <p>{addr.streetAddress}</p>
                    {addr.streetAddress2 && <p>{addr.streetAddress2}</p>}
                    <p>
                      {addr.city}, {addr.stateOrProvince} {addr.postalCode}
                    </p>
                    <p>{addr.countryCode}</p>
                    <p className="pt-1 text-2xs text-fg-subtle">{addr.phoneNumber}</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {!addr.isDefaultShipping && (
                      <button
                        type="button"
                        onClick={() => setDefaultShippingAddress(addr.id)}
                        className="text-2xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {t('addresses.setDefaultShipping')}
                      </button>
                    )}
                    {!addr.isDefaultBilling && (
                      <button
                        type="button"
                        onClick={() => setDefaultBillingAddress(addr.id)}
                        className="text-2xs font-semibold text-fg-subtle hover:text-fg-primary hover:underline cursor-pointer"
                      >
                        {t('addresses.setDefaultBilling')}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      aria-label="Edit address"
                      className="p-1 rounded-md text-fg-subtle hover:text-primary transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      aria-label="Delete address"
                      className="p-1 rounded-md text-fg-subtle hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-border-default bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <h3 id="address-modal-title" className="text-base font-bold text-fg-primary">
                {editingAddress ? t('addresses.edit') : t('addresses.addNew')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="rounded-full p-1.5 text-fg-subtle hover:bg-surface-muted hover:text-fg-primary transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4">
              {/* Label selector */}
              <div>
                <label className="block text-xs font-semibold text-fg-primary mb-1">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {(['home', 'work', 'other'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLabel(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize cursor-pointer transition-colors ${
                        label === opt
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-default bg-surface text-fg-muted hover:bg-surface-muted'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="address-fullName"
                  className="block text-xs font-semibold text-fg-primary mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="address-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                />
                {fieldErrors['fullName'] && (
                  <p className="text-2xs text-destructive mt-1">{fieldErrors['fullName']}</p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label
                  htmlFor="address-street"
                  className="block text-xs font-semibold text-fg-primary mb-1"
                >
                  Street Address *
                </label>
                <input
                  id="address-street"
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Market Street"
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                />
                {fieldErrors['streetAddress'] && (
                  <p className="text-2xs text-destructive mt-1">{fieldErrors['streetAddress']}</p>
                )}
              </div>

              {/* Street Address 2 */}
              <div>
                <label
                  htmlFor="address-street2"
                  className="block text-xs font-semibold text-fg-primary mb-1"
                >
                  Apt, Suite, Unit (Optional)
                </label>
                <input
                  id="address-street2"
                  type="text"
                  value={streetAddress2}
                  onChange={(e) => setStreetAddress2(e.target.value)}
                  placeholder="Apt 4B"
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                />
              </div>

              {/* City, State, Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="address-city"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    City *
                  </label>
                  <input
                    id="address-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {fieldErrors['city'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['city']}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address-state"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    State / Region *
                  </label>
                  <input
                    id="address-state"
                    type="text"
                    value={stateOrProvince}
                    onChange={(e) => setStateOrProvince(e.target.value)}
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {fieldErrors['stateOrProvince'] && (
                    <p className="text-2xs text-destructive mt-1">
                      {fieldErrors['stateOrProvince']}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address-postal"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    Postal Code *
                  </label>
                  <input
                    id="address-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {fieldErrors['postalCode'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['postalCode']}</p>
                  )}
                </div>
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="address-phone"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="address-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {fieldErrors['phoneNumber'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['phoneNumber']}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="address-country"
                    className="block text-xs font-semibold text-fg-primary mb-1"
                  >
                    Country Code (2-letter) *
                  </label>
                  <input
                    id="address-country"
                    type="text"
                    maxLength={2}
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-fg-primary uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
                  />
                  {fieldErrors['countryCode'] && (
                    <p className="text-2xs text-destructive mt-1">{fieldErrors['countryCode']}</p>
                  )}
                </div>
              </div>

              {/* Default Flags */}
              <div className="pt-2 space-y-2 border-t border-border-subtle">
                <label className="flex items-center gap-2 text-xs font-medium text-fg-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefaultShipping}
                    onChange={(e) => setIsDefaultShipping(e.target.checked)}
                    className="rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span>{t('addresses.setDefaultShipping')}</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-fg-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefaultBilling}
                    onChange={(e) => setIsDefaultBilling(e.target.checked)}
                    className="rounded border-border-default text-primary focus:ring-primary"
                  />
                  <span>{t('addresses.setDefaultBilling')}</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border-subtle">
                <Button
                  type="button"
                  variant="tertiary"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="font-semibold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                  className="font-bold cursor-pointer"
                >
                  {isSaving ? t('account.saving') : t('account.saveChanges')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
