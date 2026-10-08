'use client';

import * as React from 'react';
import { ProductCard, type ProductCardVariant } from '@/components/product-card';
import { MOCK_PRODUCTS } from '@/domains/catalog/fixtures';
import { useTheme } from '@/lib/theme/theme-context';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Separator,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Spinner,
  Toast,
  Price,
  Rating,
  QuantityControl,
} from '@/components/ui';

export default function ShowcasePage(): React.JSX.Element {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [qty, setQty] = React.useState<number>(2);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
  const [activeVariant, setActiveVariant] = React.useState<ProductCardVariant>('standard');
  const [wishlistMap, setWishlistMap] = React.useState<Record<string, boolean>>({});
  const [actionLog, setActionLog] = React.useState<string | null>(null);

  const handleToggleWishlist = (prod: (typeof MOCK_PRODUCTS)[0]): void => {
    setWishlistMap((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }));
    setActionLog(`Wishlist toggled for: ${prod.slug}`);
  };

  const handleQuickAction = (prod: (typeof MOCK_PRODUCTS)[0]): void => {
    setActionLog(`Quick Action triggered for: ${prod.slug}`);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-canvas text-fg-primary p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-subtle pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UI Primitives Test Surface</h1>
            <p className="text-sm text-fg-muted mt-1">
              Internal Phase 1D component isolation &amp; accessibility verification bench.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-fg-muted font-medium">
              Theme: {theme} ({resolvedTheme})
            </span>
            <Button
              variant={theme === 'light' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              System
            </Button>
          </div>
        </div>

        {/* Section 1: Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            1. Buttons &amp; Loading States
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="tertiary">Tertiary Action</Button>
            <Button variant="ghost">Ghost Action</Button>
            <Button variant="destructive">Destructive Action</Button>
            <Button variant="link">Link Style</Button>
            <Button loading loadingText="Saving...">
              Loading
            </Button>
            <Button disabled>Disabled Button</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button size="xs">Extra Small (xs)</Button>
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
            <Button size="xl">Extra Large (xl)</Button>
          </div>
        </section>

        {/* Section 2: Form Controls */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            2. Form Inputs &amp; Controls
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Standard Field"
              placeholder="Enter text..."
              description="Informational field prompt"
            />
            <Input
              label="Required Error Field"
              required
              error="Validation error message"
              defaultValue="Invalid input value"
            />
            <Input label="Success State" success defaultValue="valid@enterprise.com" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Textarea
              label="Textarea with Counter"
              showCount
              maxLength={120}
              placeholder="Write feedback..."
              defaultValue="Testing multi-line primitive behavior."
            />
            <div className="space-y-4">
              <label className="text-sm font-medium text-fg-primary block">Select Primitive</label>
              <Select defaultValue="option-2">
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value="option-1">Consumer Goods</SelectItem>
                    <SelectItem value="option-2">Industrial Equipment</SelectItem>
                    <SelectItem value="option-3">Raw Materials</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-4">
            <Checkbox label="Accept terms and conditions" defaultChecked />
            <Checkbox label="Indeterminate batch selection" indeterminate />
            <Checkbox label="Disabled option" disabled />
            <Switch label="Real-time webhooks" defaultChecked />
            <Switch label="Disabled toggle" disabled />
          </div>

          <div className="pt-2">
            <RadioGroup defaultValue="r2" className="flex gap-6">
              <RadioGroupItem value="r1" label="Standard tier" />
              <RadioGroupItem value="r2" label="Enterprise tier" />
              <RadioGroupItem value="r3" label="Dedicated tier" disabled />
            </RadioGroup>
          </div>
        </section>

        {/* Section 3: Badges & Avatars */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            3. Badges &amp; Avatars
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success" dot>
              Active
            </Badge>
            <Badge variant="warning" dot>
              Pending
            </Badge>
            <Badge variant="destructive" dot>
              Failed
            </Badge>
            <Badge variant="info">Information</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Avatar size="xs" status="online">
              <AvatarFallback>XS</AvatarFallback>
            </Avatar>
            <Avatar size="sm" status="away">
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar size="md" status="busy">
              <AvatarImage src="/placeholder.png" alt="User avatar" />
              <AvatarFallback>MD</AvatarFallback>
            </Avatar>
            <Avatar size="lg" status="online">
              <AvatarFallback>LG</AvatarFallback>
            </Avatar>
            <Avatar size="xl" status="offline">
              <AvatarFallback>XL</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Section 4: Commerce Primitives */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            4. Commerce Primitives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Display</CardTitle>
                <CardDescription>Formatted currency and comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Standard:</span>
                  <Price current="$49.00" currencyCode="USD" />
                </div>
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Sale with strike:</span>
                  <Price current="€129.99" compareAt="€159.99" discount="-19%" currencyCode="EUR" />
                </div>
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Hero size:</span>
                  <Price current="£1,250.00" size="hero" currencyCode="GBP" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Display</CardTitle>
                <CardDescription>Fractional stars with reviews count</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Small (4.5):</span>
                  <Rating value={4.5} size="sm" reviewCount={84} />
                </div>
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Medium (4.8):</span>
                  <Rating value={4.8} size="md" reviewCount={1420} />
                </div>
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Large (5.0):</span>
                  <Rating value={5.0} size="lg" reviewCount={25000} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quantity Stepper</CardTitle>
                <CardDescription>Numeric controls with bounds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-xs text-fg-muted block mb-1">
                    Interactive Stepper (Value: {qty}):
                  </span>
                  <QuantityControl value={qty} min={1} max={10} onChange={(next) => setQty(next)} />
                </div>
                <div>
                  <span className="text-xs text-fg-muted block mb-1">Disabled Stepper:</span>
                  <QuantityControl value={1} disabled onChange={() => {}} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 5: Overlays & Modals */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            5. Modals, Drawers &amp; Menus
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            {/* Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Open Test Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verification Dialog</DialogTitle>
                  <DialogDescription>
                    This is an accessible dialog primitive with focus trap and ESC key listeners.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-fg-muted py-2">
                  Dialog content properly nested within radix portals and backdrop blur overlay.
                </p>
                <DialogFooter>
                  <Button variant="tertiary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setModalOpen(false)}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="secondary">Open Test Drawer</Button>
              </DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle>Panel Drawer</DrawerTitle>
                  <DrawerDescription>
                    Slide-over drawer primitive for panels or cart previews.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="py-4 text-sm text-fg-muted">
                  Drawer handles mobile touch gestures, esc dismiss, and scroll lock.
                </div>
                <DrawerFooter>
                  <Button variant="primary" onClick={() => setDrawerOpen(false)}>
                    Close Drawer
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">Dropdown Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuItem>Organization Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="tertiary">Hover for Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Accessible tooltip content</TooltipContent>
            </Tooltip>
          </div>
        </section>

        {/* Section 6: Disclosure & Tabs */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            6. Disclosure &amp; Navigation Tabs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tabs defaultValue="tab-1" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="tab-1">Overview</TabsTrigger>
                <TabsTrigger value="tab-2">Specifications</TabsTrigger>
                <TabsTrigger value="tab-3" disabled>
                  Disabled Tab
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="tab-1"
                className="p-4 rounded-md border border-border-subtle bg-surface"
              >
                Overview tab panel content with keyboard arrow navigation.
              </TabsContent>
              <TabsContent
                value="tab-2"
                className="p-4 rounded-md border border-border-subtle bg-surface"
              >
                Technical specifications tab panel content.
              </TabsContent>
            </Tabs>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is the return policy?</AccordionTrigger>
                <AccordionContent>
                  Standard 30-day return policy on all eligible marketplace purchases.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How does multi-vendor shipping operate?</AccordionTrigger>
                <AccordionContent>
                  Each merchant fulfills items individually or via centralized fulfillment centers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Section 7: Feedback, Toasts & Skeletons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border-subtle pb-2">
            7. Feedback, Toasts &amp; Shimmer Skeletons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Toast
              variant="success"
              title="Order placed successfully"
              description="Confirmation email sent to customer."
            />
            <Toast
              variant="warning"
              title="Low inventory alert"
              description="Only 3 units remaining in stock."
            />
            <Toast
              variant="error"
              title="Payment gateway timeout"
              description="Please retry transaction in a few seconds."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Shimmer</CardTitle>
              </CardHeader>
              <CardContent>
                <SkeletonCard />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Shimmer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SkeletonText lines={4} />
                <Separator />
                <div className="flex items-center gap-3">
                  <Spinner size="sm" />
                  <span className="text-xs text-fg-muted">Async data fetch active</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Block Shimmer</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 8: Product Card System (Phase 2C Reusable Presentation Layer) */}
        <section className="space-y-6 pt-6 border-t border-border-subtle">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="brand">Phase 2C Architecture</Badge>
              <Badge variant="success" dot>
                Reusable Component System
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-fg-primary">
              8. Canonical Product Card System
            </h2>
            <p className="text-sm text-fg-muted mt-1 max-w-2xl">
              Unified presentation layer supporting 10 distinct variants, decoupled media and
              pricing, responsive layouts, WCAG 2.2 AA accessibility, and interactive affordances.
            </p>
          </div>

          {/* Action Log Feedback Banner */}
          {actionLog && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-mono">
              <span>Feedback: {actionLog}</span>
              <button
                type="button"
                onClick={() => setActionLog(null)}
                className="underline hover:text-primary-hover"
              >
                Clear
              </button>
            </div>
          )}

          {/* Variant Selector Tabs */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted block">
              Select Variant Showcase:
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'standard',
                  'compact',
                  'large',
                  'editorial',
                  'horizontal',
                  'search',
                  'recommendation',
                  'flash-sale',
                  'sponsored',
                  'recently-viewed',
                ] as ProductCardVariant[]
              ).map((variantKey) => (
                <Button
                  key={variantKey}
                  type="button"
                  variant={activeVariant === variantKey ? 'primary' : 'tertiary'}
                  size="sm"
                  onClick={() => setActiveVariant(variantKey)}
                  className="capitalize font-medium"
                >
                  {variantKey.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Variant Live Preview Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-fg-muted">
              Live Preview: {activeVariant.toUpperCase()} Variant
            </h3>
            <div
              className={
                activeVariant === 'horizontal'
                  ? 'flex flex-col gap-4 max-w-4xl'
                  : activeVariant === 'compact' || activeVariant === 'recently-viewed'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
                    : activeVariant === 'large' || activeVariant === 'editorial'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              }
            >
              {MOCK_PRODUCTS.slice(0, activeVariant === 'horizontal' ? 3 : 4).map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  variant={activeVariant}
                  isWishlisted={wishlistMap[prod.id]}
                  flashSaleProgressPercent={activeVariant === 'flash-sale' ? 72 : undefined}
                  editorialBadgeText={activeVariant === 'editorial' ? "Editor's Choice" : undefined}
                  onWishlistToggle={handleToggleWishlist}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          </div>

          {/* Presentation States Showcase */}
          <div className="space-y-4 pt-6 border-t border-border-subtle">
            <h3 className="text-sm font-bold uppercase tracking-wider text-fg-muted">
              Card States Demonstration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 1. Normal Default */}
              <div className="space-y-2">
                <span className="text-2xs font-semibold text-fg-muted uppercase tracking-wider block">
                  1. Default / Active State
                </span>
                <ProductCard
                  product={MOCK_PRODUCTS[0]!}
                  variant="standard"
                  isWishlisted={wishlistMap[MOCK_PRODUCTS[0]!.id]}
                  onWishlistToggle={handleToggleWishlist}
                />
              </div>

              {/* 2. Loading Skeleton */}
              <div className="space-y-2">
                <span className="text-2xs font-semibold text-fg-muted uppercase tracking-wider block">
                  2. Loading State (Skeleton)
                </span>
                <ProductCard product={MOCK_PRODUCTS[0]!} variant="standard" isLoading />
              </div>

              {/* 3. Unavailable / Out-of-Stock */}
              <div className="space-y-2">
                <span className="text-2xs font-semibold text-fg-muted uppercase tracking-wider block">
                  3. Unavailable State
                </span>
                <ProductCard product={MOCK_PRODUCTS[1]!} variant="standard" isUnavailable />
              </div>

              {/* 4. Sponsored State */}
              <div className="space-y-2">
                <span className="text-2xs font-semibold text-fg-muted uppercase tracking-wider block">
                  4. Sponsored State
                </span>
                <ProductCard
                  product={MOCK_PRODUCTS[2]!}
                  variant="sponsored"
                  isWishlisted={wishlistMap[MOCK_PRODUCTS[2]!.id]}
                  onWishlistToggle={handleToggleWishlist}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
