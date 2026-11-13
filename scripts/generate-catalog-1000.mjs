import fs from 'fs';
import path from 'path';

// Load base categories and brands to ensure strict relational foreign keys
const baseBrands = [
  { id: 'brand-apple', slug: 'apple', name: 'Apple', status: 'featured', isFeatured: true },
  { id: 'brand-sony', slug: 'sony', name: 'Sony', status: 'featured', isFeatured: true },
  { id: 'brand-samsung', slug: 'samsung', name: 'Samsung', status: 'featured', isFeatured: true },
  { id: 'brand-bose', slug: 'bose', name: 'Bose', status: 'featured', isFeatured: true },
  { id: 'brand-dell', slug: 'dell', name: 'Dell', status: 'active', isFeatured: false },
  { id: 'brand-lenovo', slug: 'lenovo', name: 'Lenovo', status: 'active', isFeatured: false },
  { id: 'brand-asus', slug: 'asus', name: 'ASUS', status: 'active', isFeatured: false },
  { id: 'brand-nike', slug: 'nike', name: 'Nike', status: 'featured', isFeatured: true },
  { id: 'brand-adidas', slug: 'adidas', name: 'Adidas', status: 'featured', isFeatured: true },
  { id: 'brand-patagonia', slug: 'patagonia', name: 'Patagonia', status: 'active', isFeatured: false },
  { id: 'brand-arcteryx', slug: 'arcteryx', name: "Arc'teryx", status: 'featured', isFeatured: true },
  { id: 'brand-herman-miller', slug: 'herman-miller', name: 'Herman Miller', status: 'featured', isFeatured: true },
  { id: 'brand-steelcase', slug: 'steelcase', name: 'Steelcase', status: 'active', isFeatured: false },
  { id: 'brand-dyson', slug: 'dyson', name: 'Dyson', status: 'featured', isFeatured: true },
  { id: 'brand-breville', slug: 'breville', name: 'Breville', status: 'featured', isFeatured: true },
  { id: 'brand-kitchenaid', slug: 'kitchenaid', name: 'KitchenAid', status: 'active', isFeatured: false },
  { id: 'brand-canon', slug: 'canon', name: 'Canon', status: 'featured', isFeatured: true },
  { id: 'brand-fujifilm', slug: 'fujifilm', name: 'Fujifilm', status: 'active', isFeatured: false },
  { id: 'brand-leica', slug: 'leica', name: 'Leica', status: 'featured', isFeatured: true },
  { id: 'brand-dji', slug: 'dji', name: 'DJI', status: 'featured', isFeatured: true },
  { id: 'brand-rolex', slug: 'rolex', name: 'Rolex', status: 'featured', isFeatured: true },
  { id: 'brand-omega', slug: 'omega', name: 'Omega', status: 'featured', isFeatured: true },
  { id: 'brand-cartier', slug: 'cartier', name: 'Cartier', status: 'active', isFeatured: false },
  { id: 'brand-creed', slug: 'creed', name: 'Creed', status: 'featured', isFeatured: true },
  { id: 'brand-tom-ford', slug: 'tom-ford', name: 'Tom Ford', status: 'featured', isFeatured: true },
  { id: 'brand-logitech', slug: 'logitech', name: 'Logitech', status: 'active', isFeatured: false },
  { id: 'brand-keychron', slug: 'keychron', name: 'Keychron', status: 'featured', isFeatured: true },
  { id: 'brand-garmin', slug: 'garmin', name: 'Garmin', status: 'featured', isFeatured: true },
];

const baseSellers = [
  { id: 'seller-tech-direct', name: 'TechDirect Express', slug: 'tech-direct-express', tier: 'enterprise', verified: true },
  { id: 'seller-official', name: 'Official Flagship Store', slug: 'official-flagship-store', tier: 'flagship', verified: true },
  { id: 'seller-tokyo-audio', name: 'Tokyo Audio Vault', slug: 'tokyo-audio-vault', tier: 'verified', verified: true },
  { id: 'seller-milan-luxury', name: 'Milan Luxury Sartoriale', slug: 'milan-luxury-sartoriale', tier: 'enterprise', verified: true },
  { id: 'seller-nordic-living', name: 'Nordic Living Collective', slug: 'nordic-living-collective', tier: 'verified', verified: true },
  { id: 'seller-swiss-chronos', name: 'Geneva Haute Horlogerie', slug: 'geneva-haute-horlogerie', tier: 'flagship', verified: true },
];

const baseCategories = [
  { id: 'cat-electronics', slug: 'electronics', name: { en: 'Electronics' }, level: 0, path: '/electronics', parentId: null },
  { id: 'cat-computers-laptops', slug: 'computers-laptops', name: { en: 'Computers & Laptops' }, level: 1, path: '/electronics/computers-laptops', parentId: 'cat-electronics' },
  { id: 'cat-laptops', slug: 'laptops', name: { en: 'Laptops' }, level: 2, path: '/electronics/computers-laptops/laptops', parentId: 'cat-computers-laptops' },
  { id: 'cat-ultraportable-laptops', slug: 'ultraportable-laptops', name: { en: 'Ultraportable Laptops' }, level: 3, path: '/electronics/computers-laptops/laptops/ultraportable-laptops', parentId: 'cat-laptops' },
  { id: 'cat-workstation-ultrabooks', slug: 'workstation-ultrabooks', name: { en: 'Workstation Ultrabooks' }, level: 4, path: '/electronics/computers-laptops/laptops/ultraportable-laptops/workstation-ultrabooks', parentId: 'cat-ultraportable-laptops' },
  { id: 'cat-audio-headphones', slug: 'audio-headphones', name: { en: 'Audio & Headphones' }, level: 1, path: '/electronics/audio-headphones', parentId: 'cat-electronics' },
  { id: 'cat-wireless-headphones', slug: 'wireless-headphones', name: { en: 'Wireless Headphones' }, level: 2, path: '/electronics/audio-headphones/wireless-headphones', parentId: 'cat-audio-headphones' },
  { id: 'cat-noise-cancelling', slug: 'noise-cancelling-headphones', name: { en: 'Noise Cancelling Headphones' }, level: 3, path: '/electronics/audio-headphones/wireless-headphones/noise-cancelling-headphones', parentId: 'cat-wireless-headphones' },
  { id: 'cat-mobile-accessories', slug: 'mobile-accessories', name: { en: 'Mobile Accessories' }, level: 1, path: '/electronics/mobile-accessories', parentId: 'cat-electronics' },
  { id: 'cat-power-banks', slug: 'power-banks', name: { en: 'Power Banks & Portable Chargers' }, level: 2, path: '/electronics/mobile-accessories/power-banks', parentId: 'cat-mobile-accessories' },
  { id: 'cat-monitors-displays', slug: 'monitors-displays', name: { en: 'Monitors & Displays' }, level: 1, path: '/electronics/monitors-displays', parentId: 'cat-electronics' },
  { id: 'cat-curved-gaming-monitors', slug: 'curved-gaming-monitors', name: { en: 'Curved Gaming Monitors' }, level: 2, path: '/electronics/monitors-displays/curved-gaming-monitors', parentId: 'cat-monitors-displays' },
  { id: 'cat-fashion', slug: 'fashion', name: { en: 'Fashion' }, level: 0, path: '/fashion', parentId: null },
  { id: 'cat-mens-footwear', slug: 'mens-footwear', name: { en: "Men's Footwear" }, level: 1, path: '/fashion/mens-footwear', parentId: 'cat-fashion' },
  { id: 'cat-athletic-shoes', slug: 'athletic-shoes', name: { en: 'Athletic Shoes' }, level: 2, path: '/fashion/mens-footwear/athletic-shoes', parentId: 'cat-mens-footwear' },
  { id: 'cat-marathon-running', slug: 'marathon-running-shoes', name: { en: 'Marathon & Road Running' }, level: 3, path: '/fashion/mens-footwear/athletic-shoes/marathon-running-shoes', parentId: 'cat-athletic-shoes' },
  { id: 'cat-home-living', slug: 'home-living', name: { en: 'Home & Living' }, level: 0, path: '/home-living', parentId: null },
  { id: 'cat-office-furniture', slug: 'office-furniture', name: { en: 'Office Furniture' }, level: 1, path: '/home-living/office-furniture', parentId: 'cat-home-living' },
  { id: 'cat-ergonomic-seating', slug: 'ergonomic-seating', name: { en: 'Ergonomic Office Chairs' }, level: 2, path: '/home-living/office-furniture/ergonomic-seating', parentId: 'cat-office-furniture' },
];

const categoryAliasMap = {
  'cat-luxury-watches': 'cat-fashion',
  'cat-coffee-espresso': 'cat-home-living',
  'cat-mens-outerwear': 'cat-fashion',
  'cat-mens-fashion': 'cat-fashion',
  'cat-beauty-wellness': 'cat-fashion',
  'cat-appliances': 'cat-home-living',
  'cat-sports-outdoors': 'cat-athletic-shoes',
};

const blueprints = [
  // Laptops & Workstations
  {
    brand: 'brand-apple',
    cat: 'cat-ultraportable-laptops',
    baseTitle: 'Apple MacBook Pro',
    slugPrefix: 'apple-macbook-pro',
    sizes: ['14-inch', '16-inch'],
    chips: ['M3 Pro', 'M3 Max', 'M4 Pro', 'M4 Max'],
    variants: [
      { mem: '18GB Unified Memory, 512GB SSD', price: 199900 },
      { mem: '36GB Unified Memory, 1TB SSD', price: 249900 },
      { mem: '64GB Unified Memory, 2TB SSD', price: 349900 },
      { mem: '128GB Unified Memory, 4TB SSD', price: 489900 },
    ],
    colors: ['Space Black', 'Silver'],
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    tags: ['laptop', 'apple', 'macos', 'workstation', 'creative'],
    specs: { display: 'Liquid Retina XDR', refreshRate: '120Hz ProMotion', battery: 'Up to 22 hours', ports: 'Thunderbolt 4, HDMI, MagSafe 3' },
  },
  {
    brand: 'brand-apple',
    cat: 'cat-laptops',
    baseTitle: 'Apple MacBook Air',
    slugPrefix: 'apple-macbook-air',
    sizes: ['13-inch', '15-inch'],
    chips: ['M2', 'M3'],
    variants: [
      { mem: '8GB Memory, 256GB SSD', price: 109900 },
      { mem: '16GB Memory, 512GB SSD', price: 129900 },
      { mem: '24GB Memory, 1TB SSD', price: 169900 },
    ],
    colors: ['Midnight', 'Starlight', 'Space Gray', 'Silver'],
    img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
    tags: ['laptop', 'ultrabook', 'apple', 'lightweight'],
    specs: { display: 'Liquid Retina Display', weight: '2.7 lbs', battery: 'Up to 18 hours', charging: 'MagSafe 3' },
  },
  {
    brand: 'brand-dell',
    cat: 'cat-workstation-ultrabooks',
    baseTitle: 'Dell XPS High Performance Laptop',
    slugPrefix: 'dell-xps',
    sizes: ['13 Plus', '14 OLED', '16 OLED'],
    chips: ['Intel Core Ultra 7', 'Intel Core Ultra 9'],
    variants: [
      { mem: '32GB LPDDR5x, 1TB PCIe NVMe SSD', price: 219900 },
      { mem: '64GB LPDDR5x, 2TB PCIe NVMe SSD', price: 289900 },
    ],
    colors: ['Platinum Silver', 'Graphite'],
    img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
    tags: ['dell', 'windows', 'intel', 'xps', 'workstation'],
    specs: { display: 'InfinityEdge 3.2K OLED Touch', gpu: 'NVIDIA GeForce RTX 4070 8GB', keyboard: 'Seamless Glass Touchpad' },
  },
  {
    brand: 'brand-lenovo',
    cat: 'cat-laptops',
    baseTitle: 'Lenovo ThinkPad X1 Carbon Ultrabook',
    slugPrefix: 'lenovo-thinkpad-x1',
    sizes: ['Gen 11', 'Gen 12'],
    chips: ['Intel Core Ultra 7 155H', 'Intel Core i7-1365U vPro'],
    variants: [
      { mem: '16GB RAM, 512GB OPAL SSD', price: 164900 },
      { mem: '32GB RAM, 1TB OPAL SSD', price: 209900 },
      { mem: '64GB RAM, 2TB OPAL SSD', price: 269900 },
    ],
    colors: ['Deep Black Carbon Weave', 'Matte Black'],
    img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
    tags: ['lenovo', 'thinkpad', 'business', 'enterprise'],
    specs: { keyboard: 'Spill-resistant TrackPoint', security: 'dTPM 2.0 & Fingerprint Reader', cert: 'MIL-STD-810H Tested' },
  },
  {
    brand: 'brand-asus',
    cat: 'cat-workstation-ultrabooks',
    baseTitle: 'ASUS ROG Zephyrus Ultra Gaming Laptop',
    slugPrefix: 'asus-rog-zephyrus',
    sizes: ['G14 Compact', 'G16 Precision'],
    chips: ['AMD Ryzen 9 8945HS', 'Intel Core Ultra 9 185H'],
    variants: [
      { mem: '32GB RAM, RTX 4080 12GB, 1TB SSD', price: 249900 },
      { mem: '64GB RAM, RTX 4090 16GB, 2TB SSD', price: 329900 },
    ],
    colors: ['Eclipse Gray', 'Platinum White'],
    img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
    tags: ['asus', 'rog', 'gaming', 'geforce', 'rtx4090'],
    specs: { display: 'ROG Nebula OLED 240Hz', audio: '6-Speaker Sound System with Dolby Atmos', cooling: 'ROG Intelligent Vapor Chamber' },
  },

  // Audio & Headphones
  {
    brand: 'brand-sony',
    cat: 'cat-wireless-headphones',
    baseTitle: 'Sony WH-1000XM Wireless Noise Canceling Headphones',
    slugPrefix: 'sony-wh-1000xm',
    sizes: ['XM4 Master', 'XM5 Reference', 'XM6 Prototype Edition'],
    chips: ['HD Noise Cancelling Processor QN1', 'Integrated Processor V1'],
    variants: [
      { mem: 'Standard Edition with Travel Case', price: 39900 },
      { mem: 'Executive Studio Bundle with DAC Cable', price: 47900 },
    ],
    colors: ['Black', 'Silver Platinum', 'Midnight Blue'],
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    tags: ['sony', 'audio', 'headphones', 'anc', 'bluetooth'],
    specs: { driver: '30mm Carbon Fiber Composite', battery: '30 Hours with Quick Charge', codecs: 'LDAC, AAC, SBC, Hi-Res Wireless' },
  },
  {
    brand: 'brand-bose',
    cat: 'cat-wireless-headphones',
    baseTitle: 'Bose QuietComfort Ultra Flagship Headphones',
    slugPrefix: 'bose-quietcomfort-ultra',
    sizes: ['Over-Ear Studio', 'In-Ear Spatial Earbuds'],
    chips: ['Custom Bose DSP Acoustic Engine'],
    variants: [
      { mem: 'Single Wireless Unit', price: 42900 },
      { mem: 'Travel Deluxe Kit with Airline Adapter', price: 46900 },
    ],
    colors: ['Black', 'White Smoke', 'Sandstone Gold'],
    img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
    tags: ['bose', 'noise-cancelling', 'headphones', 'spatial-audio'],
    specs: { audioMode: 'Bose Immersive Audio', microphones: '12-Mic Active Array', appSupport: 'Bose Music EQ Customization' },
  },
  {
    brand: 'brand-apple',
    cat: 'cat-wireless-headphones',
    baseTitle: 'Apple AirPods Max Wireless Over-Ear Headphones',
    slugPrefix: 'apple-airpods-max',
    sizes: ['Gen 1 Lightning', 'Gen 2 USB-C'],
    chips: ['Apple H1 Headphone Chip (each ear cup)'],
    variants: [
      { mem: 'Standard Edition with Smart Case', price: 54900 },
    ],
    colors: ['Space Gray', 'Silver', 'Sky Blue', 'Pink', 'Midnight', 'Starlight'],
    img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
    tags: ['apple', 'airpods', 'headphones', 'hifi', 'spatial-audio'],
    specs: { driver: '40mm Apple-designed Dynamic Driver', canopy: 'Breathable Knit Mesh Band', battery: '20 Hours Active Listening' },
  },

  // Smartphones
  {
    brand: 'brand-apple',
    cat: 'cat-electronics',
    baseTitle: 'Apple iPhone Flagship Pro Max',
    slugPrefix: 'apple-iphone-pro-max',
    sizes: ['15 Pro', '15 Pro Max', '16 Pro', '16 Pro Max'],
    chips: ['A17 Pro (3nm)', 'A18 Pro Neural Engine'],
    variants: [
      { mem: '256GB NVMe Storage', price: 119900 },
      { mem: '512GB NVMe Storage', price: 139900 },
      { mem: '1TB NVMe Storage', price: 159900 },
    ],
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Desert Titanium'],
    img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
    tags: ['apple', 'iphone', 'smartphone', '5g', 'titanium'],
    specs: { display: 'Super Retina XDR OLED ProMotion', camera: '48MP Fusion Camera with 5x Telephoto', chassis: 'Grade 5 Titanium' },
  },
  {
    brand: 'brand-samsung',
    cat: 'cat-electronics',
    baseTitle: 'Samsung Galaxy Ultra Smartphone with S-Pen',
    slugPrefix: 'samsung-galaxy-ultra',
    sizes: ['S23 Ultra', 'S24 Ultra', 'Z Fold 5', 'Z Fold 6'],
    chips: ['Snapdragon 8 Gen 3 for Galaxy'],
    variants: [
      { mem: '12GB RAM, 256GB UFS 4.0', price: 129900 },
      { mem: '12GB RAM, 512GB UFS 4.0', price: 141900 },
      { mem: '16GB RAM, 1TB UFS 4.0', price: 165900 },
    ],
    colors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
    tags: ['samsung', 'galaxy', 'android', 'camera', 'ai'],
    specs: { camera: '200MP Quad Tele System with AI Zoom', display: '6.8" Dynamic AMOLED 2X 2600 nits', stylus: 'Integrated S-Pen' },
  },

  // Cameras & Imaging
  {
    brand: 'brand-canon',
    cat: 'cat-electronics',
    baseTitle: 'Canon EOS R Professional Mirrorless Camera',
    slugPrefix: 'canon-eos-r',
    sizes: ['R5 Mark II Body', 'R6 Mark II Kit', 'R3 Cinema Pro'],
    chips: ['DIGIC X Image Processor with Accelerated Capture Engine'],
    variants: [
      { mem: 'Body Only', price: 389900 },
      { mem: 'Kit with RF 24-70mm f/2.8L IS USM Lens', price: 549900 },
      { mem: 'Master Cinema Kit with 24-105mm & Dual V-Mount Batteries', price: 689900 },
    ],
    colors: ['Matte Magnesium Black'],
    img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
    tags: ['canon', 'camera', 'mirrorless', 'photography', '4k'],
    specs: { sensor: '45MP Full-Frame Back-Illuminated Stacked CMOS', video: '8K 60p RAW internal', autofocus: 'Dual Pixel Intelligent AF' },
  },
  {
    brand: 'brand-sony',
    cat: 'cat-electronics',
    baseTitle: 'Sony Alpha Full-Frame Mirrorless Camera',
    slugPrefix: 'sony-alpha-camera',
    sizes: ['A7 IV All-Rounder', 'A7R V High-Resolution', 'FX3 Cinema Line'],
    chips: ['BIONZ XR Image Processing Engine'],
    variants: [
      { mem: 'Camera Body Only', price: 249900 },
      { mem: 'With FE 24-70mm f/2.8 GM II Lens', price: 429900 },
    ],
    colors: ['Carbon Black'],
    img: 'https://images.unsplash.com/photo-1502982720700-bfff97f2da6d?w=800',
    tags: ['sony', 'alpha', 'photography', 'videography', 'fullframe'],
    specs: { sensor: '61MP Exmor R CMOS Sensor', stabilization: '8-Step 5-Axis In-Body Stabilization', ai: 'Real-time Recognition AF Unit' },
  },
  {
    brand: 'brand-dji',
    cat: 'cat-electronics',
    baseTitle: 'DJI Aerial Drone System',
    slugPrefix: 'dji-drone',
    sizes: ['Mavic 3 Pro Cine', 'Mini 4 Pro Fly More', 'Inspire 3 Cinema'],
    chips: ['O4 HD Video Transmission System'],
    variants: [
      { mem: 'Standard Remote Package', price: 159900 },
      { mem: 'Fly More Combo with 3 Batteries and Bag', price: 219900 },
      { mem: 'Cine Edition with 1TB Internal SSD and ProRes 422 HQ', price: 389900 },
    ],
    colors: ['Space Gray Ceramic Finish'],
    img: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800',
    tags: ['dji', 'drone', '4k', 'aerial', 'hasselblad'],
    specs: { camera: 'Hasselblad 4/3 CMOS Tri-Camera Array', flightTime: 'Up to 43 Minutes', sensing: 'Omnidirectional Obstacle Sensing' },
  },

  // Luxury Watches & Horology
  {
    brand: 'brand-rolex',
    cat: 'cat-luxury-watches',
    baseTitle: 'Rolex Luxury Chronometer Timepiece',
    slugPrefix: 'rolex-chronometer',
    sizes: ['Submariner Date 41mm', 'Cosmograph Daytona 40mm', 'GMT-Master II Batman 40mm', 'Day-Date 40mm Presidential'],
    chips: ['Rolex Calibre 3235 Superlative Chronometer'],
    variants: [
      { mem: 'Oystersteel with Cerachrom Ceramic Bezel', price: 1450000 },
      { mem: '18ct Yellow Gold with Sunray Diamond Dial', price: 3850000 },
      { mem: 'Everose Gold with Baguette Sapphire Hour Markers', price: 4950000 },
    ],
    colors: ['Black Dial Cerachrom', 'Deep Sea Blue Dial', 'Olive Green Sunray Dial'],
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
    tags: ['rolex', 'luxury', 'watch', 'horology', 'swiss-made'],
    specs: { movement: 'Perpetual Mechanical Self-Winding', waterResistance: '300 metres / 1,000 feet', clasp: 'Oysterlock safety with Glidelock extension' },
  },
  {
    brand: 'brand-omega',
    cat: 'cat-luxury-watches',
    baseTitle: 'Omega Speedmaster Professional Chronograph',
    slugPrefix: 'omega-speedmaster',
    sizes: ['Moonwatch 42mm Co-Axial Master', 'Dark Side of the Moon Ceramic 44mm'],
    chips: ['Omega Co-Axial Master Chronometer Calibre 3861'],
    variants: [
      { mem: 'Hesalite Glass with Brushed Steel Bracelet', price: 700000 },
      { mem: 'Sapphire Sandwich with Exhibition Caseback', price: 800000 },
      { mem: 'Moonshine Gold Limited Edition', price: 2950000 },
    ],
    colors: ['Step Matte Black', 'Sedna Gold Dial', 'Meteorite Dial'],
    img: 'https://images.unsplash.com/photo-1547996160-71dfa88c9dd0?w=800',
    tags: ['omega', 'speedmaster', 'watch', 'nasa', 'moonwatch'],
    specs: { certification: 'METAS Master Chronometer certified to 15,000 gauss', tachymeter: 'Dot Over Ninety (DON) Bezel', powerReserve: '50 Hours' },
  },

  // Modern Ergonomic Furniture
  {
    brand: 'brand-herman-miller',
    cat: 'cat-ergonomic-seating',
    baseTitle: 'Herman Miller Ergonomic Task Chair',
    slugPrefix: 'herman-miller-chair',
    sizes: ['Aeron Size B (Medium)', 'Aeron Size C (Large)', 'Embody Gaming Chair', 'Cosm High-Back'],
    chips: ['PostureFit SL Spinal Stabilization System'],
    variants: [
      { mem: 'Standard Tilt with Fixed Arms', price: 129500 },
      { mem: 'Fully Featured: Forward Tilt, Height & Angle Adjustable Leather Arms', price: 189500 },
      { mem: 'Polished Aluminum Executive Edition with Mineral Pellicle', price: 239500 },
    ],
    colors: ['Graphite', 'Carbon', 'Mineral White with Polished Alloy'],
    img: 'https://images.unsplash.com/photo-1580481077195-c328a37db729?w=800',
    tags: ['herman-miller', 'chair', 'ergonomic', 'office', 'furniture'],
    specs: { material: '8Z Pellicle Elastomeric Suspension', warranty: '12-Year 3-Shift Full Manufacturer Warranty', adjustment: 'Harmonic 2 Tilt Mechanism' },
  },

  // Kitchen & Espresso Appliances
  {
    brand: 'brand-breville',
    cat: 'cat-coffee-espresso',
    baseTitle: 'Breville Precision Espresso & Coffee Machine',
    slugPrefix: 'breville-espresso',
    sizes: ['Barista Touch Impress', 'Dual Boiler Commercial Grade', 'Oracle Touch Automated'],
    chips: ['ThermoJet Heating with PID Temperature Precision'],
    variants: [
      { mem: 'Brushed Stainless Steel Unit', price: 99995 },
      { mem: 'Barista Kit with Knock Box, Precision Tamper & Cleaning System', price: 124995 },
    ],
    colors: ['Brushed Stainless Steel', 'Black Truffle', 'Damson Blue'],
    img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',
    tags: ['breville', 'espresso', 'coffee', 'kitchen', 'appliance'],
    specs: { pressure: '15 Bar Italian Pump with 9 Bar Extraction', portafilter: 'Commercial-grade 58mm Stainless Steel', steamWand: 'Auto MilQ Hands-free Microfoam Texture' },
  },

  // Performance Outerwear & Footwear
  {
    brand: 'brand-arcteryx',
    cat: 'cat-mens-outerwear',
    baseTitle: "Arc'teryx Technical Mountain Jacket",
    slugPrefix: 'arcteryx-jacket',
    sizes: ['Beta AR All-Round', 'Alpha SV Severe Weather', 'Atom Heavyweight Insulated Hoody'],
    chips: ['GORE-TEX PRO Most Rugged 3-Layer Laminate'],
    variants: [
      { mem: 'Standard Mountain Fit (Sizes S to XXL)', price: 65000 },
      { mem: 'Alpine Expedition Pro Edition', price: 89900 },
    ],
    colors: ['Black Sapphire', 'Heritage Orange', 'Relic Olive', 'Phenom Red'],
    img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
    tags: ['arcteryx', 'jacket', 'goretex', 'outdoor', 'waterproof'],
    specs: { breathability: 'RET < 6 m2 Pa/W', hood: 'Helmet-compatible DropHood with Cohaesive cord locks', zippers: 'WaterTight external zippers with RS sliders' },
  },
  {
    brand: 'brand-nike',
    cat: 'cat-mens-fashion',
    baseTitle: 'Nike Athletic Performance Footwear',
    slugPrefix: 'nike-sneakers',
    sizes: ['Air Zoom Pegasus 41', 'Air Jordan 1 Retro High OG', 'Vaporfly 3 Road Racing', 'Air Max 90 Premium'],
    chips: ['Dual Zoom Air Pods with ReactX Foam'],
    variants: [
      { mem: 'Sizes US 7 to US 14 Full Sizes', price: 14000 },
      { mem: 'Limited Collector Edition with Custom Box', price: 22000 },
      { mem: 'Elite Marathon Edition with Carbon Fiber Flyplate', price: 26000 },
    ],
    colors: ['Triple White', 'Black & White Panda', 'Bred Retro', 'Volt Green Racing'],
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    tags: ['nike', 'sneakers', 'running', 'jordan', 'shoes'],
    specs: { upper: 'Engineered Breathable Jacquard Mesh', cushioning: 'ReactX Foam giving 13% more energy return', outsole: 'Signature Waffle Rubber' },
  },

  // Beauty & Luxury Fragrance
  {
    brand: 'brand-tom-ford',
    cat: 'cat-beauty-wellness',
    baseTitle: 'Tom Ford Private Blend Luxury Eau de Parfum',
    slugPrefix: 'tom-ford-private-blend',
    sizes: ['Tobacco Vanille 50ml', 'Oud Wood 100ml', 'Lost Cherry 50ml', 'Tuscan Leather 100ml'],
    chips: ['Artisanal Distillation Batch'],
    variants: [
      { mem: '50ml Flacon with Atomizer', price: 29500 },
      { mem: '100ml Flacon with Collector Decanter', price: 44500 },
      { mem: '250ml Bespoke Crystal Decanter', price: 89000 },
    ],
    colors: ['Dark Amber Crystal', 'Smoked Obsidian Flacon'],
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800',
    tags: ['tom-ford', 'fragrance', 'perfume', 'luxury', 'beauty'],
    specs: { notes: 'Tobacco Leaf, Vanilla Pod, Tonka Bean, Cocoa Accord', concentration: 'Eau de Parfum 20% Essential Oils', origin: 'Crafted in Grasse, France' },
  },
  {
    brand: 'brand-dyson',
    cat: 'cat-appliances',
    baseTitle: 'Dyson Intelligent Cordless Cleaning & Styling System',
    slugPrefix: 'dyson-system',
    sizes: ['V15 Detect Absolute', 'Airwrap Multi-Styler Complete Long', 'Supersonic Nural Hair Dryer', 'Purifier Hot+Cool HP09'],
    chips: ['Dyson Hyperdymium Motor (125,000 RPM)'],
    variants: [
      { mem: 'Core Package with 5 Attachments', price: 74999 },
      { mem: 'Complete Deluxe Suite with Stand and 10 Precision Tools', price: 94999 },
    ],
    colors: ['Iron & Nickel', 'Prussian Blue & Rich Copper', 'Ceramic Pop Multi'],
    img: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
    tags: ['dyson', 'cleaning', 'haircare', 'air-purifier', 'technology'],
    specs: { filtration: 'Whole-machine HEPA captures 99.99% of particles down to 0.1 microns', acousticEngine: 'Piezo Acoustic Sensor particle counter' },
  },
  {
    brand: 'brand-keychron',
    cat: 'cat-electronics',
    baseTitle: 'Keychron Custom QMK/VIA Mechanical Keyboard',
    slugPrefix: 'keychron-q-series',
    sizes: ['Q1 Pro 75%', 'Q3 Max TKL', 'Q6 Pro 100% Full-Size'],
    chips: ['ARM Cortex-M4 32-bit STM32F402 MCU'],
    variants: [
      { mem: 'Gateron Jupiter Red Linear Switches (Hot-Swappable)', price: 19900 },
      { mem: 'Gateron Jupiter Brown Tactile Switches with Double-Gasket Sound Dampening', price: 21900 },
      { mem: 'Gateron Jupiter Banana High-Bump Switches with Brass Plate', price: 24900 },
    ],
    colors: ['Carbon Black Anodized', 'Silver Grey', 'Shell White'],
    img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
    tags: ['keychron', 'keyboard', 'mechanical', 'custom-keyboard', 'qmk'],
    specs: { body: 'Full CNC Machined 6063 Aluminum Chassis', pollingRate: '1000Hz (2.4GHz & Wired), 90Hz (Bluetooth 5.1)', keycaps: 'Double-Shot KSA PBT' },
  },
  {
    brand: 'brand-garmin',
    cat: 'cat-sports-outdoors',
    baseTitle: 'Garmin Multisport Solar GPS Smartwatch',
    slugPrefix: 'garmin-fenix',
    sizes: ['Fenix 7S Pro 42mm', 'Fenix 7 Pro 47mm', 'Fenix 7X Pro Sapphire Solar 51mm', 'Epix Pro Gen 2 AMOLED'],
    chips: ['Multi-Band GNSS with SatIQ Technology'],
    variants: [
      { mem: 'Standard Edition with Silicone Band', price: 79999 },
      { mem: 'Sapphire Solar Titanium with DLC Coating & Chestnut Leather Band', price: 99999 },
    ],
    colors: ['Carbon Gray Titanium', 'Titanium with Fog Gray', 'Black DLC'],
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    tags: ['garmin', 'gps', 'fitness', 'smartwatch', 'solar'],
    specs: { lens: 'Power Sapphire Solar Charging Lens', batteryLife: 'Up to 37 Days in Smartwatch Mode with Solar', features: 'Built-in LED Flashlight, Hill Score, Endurance Score' },
  },
];

console.log('Generating 1,000+ authentic real-world product database catalog...');

const allProducts = [];
const allOffers = [];
let productCounter = 1;

const editions = [
  { name: 'Standard Edition', suffix: 'std', mult: 1.0 },
  { name: 'Creator Edition', suffix: 'creator', mult: 1.15 },
  { name: 'Enterprise Pro Suite', suffix: 'enterprise', mult: 1.3 },
  { name: 'Special Anniversary Limited Edition', suffix: 'anniversary', mult: 1.45 },
  { name: 'Global Traveler Edition', suffix: 'travel', mult: 1.1 },
];

for (const bp of blueprints) {
  for (const size of bp.sizes) {
    for (const chip of bp.chips) {
      for (const v of bp.variants) {
        for (const color of bp.colors) {
          for (const edition of editions) {
            if (allProducts.length >= 1050) break;

            const id = `prod-real-${String(productCounter).padStart(5, '0')}`;
            const cleanTitle = `${bp.baseTitle} ${size} (${chip}) - ${v.mem} [${color}] ${edition.name}`;
            const slug = `${bp.slugPrefix}-${size.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${chip.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${color.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${edition.suffix}-${productCounter}`;
            const sku = `AUR-${bp.slugPrefix.substring(0, 4).toUpperCase()}-${String(productCounter).padStart(5, '0')}`;
            const priceMinor = Math.round(v.price * edition.mult);
            const compareAtMinor = Math.round(priceMinor * 1.2);

            const brandObj = baseBrands.find(b => b.id === bp.brand) || baseBrands[0];
            const seller = baseSellers[productCounter % baseSellers.length];

            const ratingAvg = Number((4.5 + ((productCounter * 7) % 5) * 0.1).toFixed(1));
            const ratingCount = 80 + ((productCounter * 37) % 2400);

            const product = {
              id,
              slug,
              title: {
                en: cleanTitle,
                bn: `${cleanTitle} (অরিজিনাল)`,
                ar: `${cleanTitle} (أصلي)`,
                hi: `${cleanTitle} (मूल)`,
              },
              description: {
                en: `Experience unmatched performance with the authentic ${cleanTitle}. Engineered with genuine ${chip} architecture, featuring ${v.mem} and styled in striking ${color}. Backed by official global warranty and certified multi-vendor escrow protection.`,
                bn: `আসল ${cleanTitle} এর সাথে অতুলনীয় পারফরম্যান্স উপভোগ করুন। এতে রয়েছে খাঁটি হার্ডওয়্যার এবং গ্লোবাল ওয়ারেন্টি।`,
                ar: `استمتع بأداء لا مثيل له مع المنتج الأصلي ${cleanTitle}.`,
                hi: `वास्तविक ${cleanTitle} के साथ बेजोड़ प्रदर्शन का अनुभव करें।`,
              },
              brand: {
                id: brandObj.id,
                slug: brandObj.slug,
                name: brandObj.name,
                status: 'featured',
                isFeatured: true,
              },
              ...(() => {
                const actualCatId = categoryAliasMap[bp.cat] || bp.cat;
                const catObj = baseCategories.find((c) => c.id === actualCatId) || baseCategories[0];
                const breadcrumbs = [];
                let curr = catObj;
                while (curr) {
                  breadcrumbs.unshift({
                    id: curr.id,
                    slug: curr.slug,
                    name: curr.name,
                    level: curr.level,
                    path: curr.path,
                  });
                  curr = curr.parentId ? baseCategories.find((c) => c.id === curr.parentId) : null;
                }
                const categoryIds = breadcrumbs.map((b) => b.id);
                return {
                  categoryId: catObj.id,
                  categoryPath: catObj.path,
                  categoryBreadcrumbs: breadcrumbs,
                  categoryIds,
                };
              })(),
              media: [
                {
                  id: `med-${id}-1`,
                  type: 'image',
                  role: 'primary',
                  url: bp.img,
                  alt: { en: cleanTitle },
                  width: 800,
                  height: 800,
                  order: 0,
                },
              ],
              attributes: [],
              variants: [],
              ratingSummary: {
                average: ratingAvg,
                count: ratingCount,
                distribution: {
                  1: Math.max(1, Math.round(ratingCount * 0.01)),
                  2: Math.max(1, Math.round(ratingCount * 0.02)),
                  3: Math.max(2, Math.round(ratingCount * 0.05)),
                  4: Math.max(5, Math.round(ratingCount * 0.18)),
                  5: Math.max(10, Math.round(ratingCount * 0.74)),
                },
              },
              reviewCount: ratingCount,
              badges: [
                {
                  id: `bdg-${id}`,
                  type: 'best_seller',
                  label: { en: 'Top Choice' },
                  tone: 'accent',
                },
              ],
              tags: [...bp.tags, color.toLowerCase(), size.toLowerCase(), sku.toLowerCase()],
              status: 'active',
              offerSummary: {
                offerCount: 3,
                lowestPrice: { amountMinor: priceMinor, currency: 'USD' },
                highestPrice: { amountMinor: compareAtMinor, currency: 'USD' },
                hasMultipleOffers: true,
              },
              isDigital: false,
              createdAt: new Date(Date.now() - (productCounter * 3600000)).toISOString(),
              updatedAt: new Date().toISOString(),
            };

            const offer = {
              offerId: `ofr-${id}-primary`,
              productId: id,
              sellerId: seller.id,
              seller: {
                id: seller.id,
                name: seller.name,
                slug: seller.slug,
                rating: {
                  average: 4.9,
                  count: 3200,
                  positiveFeedbackPercent: 98.5,
                },
                badges: ['top_rated', 'authorized_dealer'],
                isVerified: true,
              },
              price: { amountMinor: priceMinor, currency: 'USD' },
              compareAtPrice: { amountMinor: compareAtMinor, currency: 'USD' },
              inventory: {
                state: 'in_stock',
                quantityAvailable: 35,
                allowsBackorder: false,
              },
              condition: 'new',
              fulfillmentType: 'marketplace_fulfilled',
              isBuyBoxWinner: true,
              shippingEstimate: {
                minDays: 2,
                maxDays: 4,
                isFreeShipping: true,
              },
              warranty: {
                durationMonths: 24,
                provider: 'manufacturer',
              },
              returnPolicyDays: 30,
            };

            allProducts.push(product);
            allOffers.push(offer);
            productCounter++;
          }
        }
      }
    }
  }
}

console.log(`Generated total products: ${allProducts.length}`);
console.log(`Generated total seller offers: ${allOffers.length}`);

const targetTsFile = path.resolve('./src/server/catalog/products-1000.ts');
fs.mkdirSync(path.dirname(targetTsFile), { recursive: true });

const fileHeader = `/**
 * ==============================================================================
 * AUREON GLOBAL 1000+ REAL WORLD PRODUCT CATALOG DATASET
 * ==============================================================================
 * Generated real-world products with authentic brand specifications,
 * multi-currency minor units pricing, and multi-vendor seller offers.
 */

import type { Product } from '@/domains/catalog/types/product';
import type { SellerOffer } from '@/domains/catalog/types/seller-offer';

export const CATALOG_PRODUCTS_1000: Product[] = ${JSON.stringify(allProducts, null, 2)};

export const CATALOG_OFFERS_1000: SellerOffer[] = ${JSON.stringify(allOffers, null, 2)};
`;

fs.writeFileSync(targetTsFile, fileHeader, 'utf8');
console.log(`Wrote dataset to: ${targetTsFile}`);
console.log('Catalog Generation Complete!');
