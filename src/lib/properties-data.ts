export interface Property {
  id: string;
  title: string;
  city: string;
  area: string;
  type: string;
  purpose: string;
  price: number;
  displayPrice: string;
  beds: number;
  baths: number;
  areaSq: string;
  tag: string;
  date: string;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
}

export const PROPERTIES: Property[] = [
  {
    id: 'grant-road-redevelopment',
    title: 'South Mumbai Redevelopment Project',
    city: 'Mumbai',
    area: 'Grant Road (Behind Apsara Theatre)',
    type: 'Apartment',
    purpose: 'Buy',
    price: 750000000,
    displayPrice: '₹ 75.00 Cr',
    beds: 2,
    baths: 2,
    areaSq: '80,000 sq ft carpet (1,00,000 BUA)',
    tag: 'Prime Project',
    date: 'Just listed',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'Exclusive Prime South Mumbai Redevelopment Opportunity located behind Apsara Theatre, Grant Road. Total Plot Area: 12,000 sq ft. Total Built-up Area: 1,00,000 sq ft | Total Carpet Area: 80,000 sq ft. Fully approved plans with Ready Commencement Certificate (CC) and Conveyance executed. Features 2 High-Rise Towers: Building 1 (18 Floors for ~80 Rehab Tenants, rent paid) and Building 2 (22 Floors Saleable Tower). Offering 1 BHK (~410 sq ft carpet) and 2 BHK (~700 sq ft carpet) units. Plinth work completed. Prevailing market rate on carpet: ₹50,000 to ₹60,000/sq ft. Offered at ₹75 Crore.',
    amenities: [
      'Plan Passed & Ready CC',
      'Conveyance Done',
      'Plinth Work Completed',
      '22-Floor Saleable Tower',
      '18-Floor Rehab Tower (~80 Tenants)',
      '1 BHK (~410 sq ft) & 2 BHK (~700 sq ft)',
      'Prime South Mumbai Location'
    ]
  },
  {
    id: 'skyline-worli',
    title: 'Skyline Residences',
    city: 'Mumbai',
    area: 'Worli',
    type: 'Apartment',
    purpose: 'Buy',
    price: 87500000,
    displayPrice: '₹ 8.75 Cr',
    beds: 3,
    baths: 3,
    areaSq: '2,140 sq ft',
    tag: 'Signature home',
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A refined high-rise residence with panoramic sea views, generous entertaining spaces and considered interiors in the heart of Worli.',
    amenities: ['Sea view', 'Private lift lobby', 'Pool & fitness studio', '24-hour security']
  },
  {
    id: 'palm-courtyard',
    title: 'The Palm Courtyard',
    city: 'Pune',
    area: 'Dhanori',
    type: 'Villa',
    purpose: 'Buy',
    price: 32000000,
    displayPrice: '₹ 3.20 Cr',
    beds: 4,
    baths: 4,
    areaSq: '3,400 sq ft',
    tag: 'Featured',
    date: '2d ago',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A calm, contemporary villa designed around a landscaped courtyard, with light-filled rooms and effortless indoor-outdoor living.',
    amenities: ['Private garden', 'Covered parking', 'Gated community', 'Solar-ready']
  },
  {
    id: 'aurelia-gurugram',
    title: 'Aurelia at 42',
    city: 'Delhi NCR',
    area: 'Golf Course Road, Gurugram',
    type: 'Apartment',
    purpose: 'Buy',
    price: 64000000,
    displayPrice: '₹ 6.40 Cr',
    beds: 4,
    baths: 4,
    areaSq: '3,050 sq ft',
    tag: 'New launch',
    date: '3d ago',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A limited collection of elevated residences, crafted for privacy and set along one of Gurugram’s most connected addresses.',
    amenities: ['Club lounge', 'Concierge desk', 'Sky garden', 'EV parking']
  },
  {
    id: 'indiranagar-loft',
    title: 'Indiranagar Garden Loft',
    city: 'Bengaluru',
    area: 'Indiranagar',
    type: 'Apartment',
    purpose: 'Rent',
    price: 145000,
    displayPrice: '₹ 1.45 L / mo',
    beds: 3,
    baths: 3,
    areaSq: '1,860 sq ft',
    tag: 'Just listed',
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A fully furnished garden-facing loft with a quiet work nook, premium finishes and immediate access to Indiranagar’s best cafés.',
    amenities: ['Furnished', 'Pet friendly', 'Dedicated workspace', 'Power backup']
  },
  {
    id: 'goa-casa',
    title: 'Casa Sombra',
    city: 'Goa',
    area: 'Assagao',
    type: 'Villa',
    purpose: 'Rent',
    price: 225000,
    displayPrice: '₹ 2.25 L / mo',
    beds: 3,
    baths: 3,
    areaSq: '2,900 sq ft',
    tag: 'Pool villa',
    date: '1d ago',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A relaxed Assagao retreat with tropical planting, a private pool and spaces designed for slow days and long dinners.',
    amenities: ['Private pool', 'Housekeeping option', 'Outdoor kitchen', 'High-speed internet']
  },
  {
    id: 'bandra-studio',
    title: 'Bandra Atelier',
    city: 'Mumbai',
    area: 'Bandra West',
    type: 'Apartment',
    purpose: 'Rent',
    price: 98000,
    displayPrice: '₹ 98k / mo',
    beds: 2,
    baths: 2,
    areaSq: '1,120 sq ft',
    tag: 'City edit',
    date: '4d ago',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A characterful city apartment with warm materials, a practical layout and the best of Bandra just outside your door.',
    amenities: ['Furnished', 'Lift access', 'Balcony', 'Secure building']
  },
  {
    id: 'hitech-office',
    title: 'Vertex Business Suite',
    city: 'Hyderabad',
    area: 'HITEC City',
    type: 'Office',
    purpose: 'Rent',
    price: 180000,
    displayPrice: '₹ 1.80 L / mo',
    beds: 0,
    baths: 2,
    areaSq: '2,650 sq ft',
    tag: 'Commercial',
    date: 'Today',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A flexible, client-ready office suite with natural light, meeting rooms and a strategic HITEC City address.',
    amenities: ['Reception area', 'Meeting room', '24-hour access', 'Visitor parking']
  },
  {
    id: 'nashik-greens',
    title: 'Orchard Greens Plot',
    city: 'Nashik',
    area: 'Gangapur Road',
    type: 'Plot',
    purpose: 'Buy',
    price: 12500000,
    displayPrice: '₹ 1.25 Cr',
    beds: 0,
    baths: 0,
    areaSq: '4,800 sq ft',
    tag: 'Land opportunity',
    date: '5d ago',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=86',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=86',
      'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1600&q=86'
    ],
    description: 'A rare residential plot in a low-density enclave, positioned for a future home surrounded by green space.',
    amenities: ['Clear title', 'Road access', 'Water connection', 'Gated enclave']
  }
];
