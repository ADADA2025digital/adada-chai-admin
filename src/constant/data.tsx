// export const productfirstData = [
//   {
//     id: 1,
//     name: "2 Flavour Chai Machine",
//     slug: "2-flavour-chai-machine",
//     category: "Chai Machine",
//     price: 1299,
//     stock: 12,
//     status: "Active",
//     featured: true,
//     image: "/logo.png",
//     shortDescription: "Premium vending machine with dual flavour support.",
//     sku: "ADADA-CM-001",
//     specifications: [
//       "2 flavour dispensing",
//       "Hot water support",
//       "Easy cleaning",
//       "Commercial usage",
//     ],
//   },
//   {
//     id: 2,
//     name: "3 Flavour Chai Machine",
//     slug: "3-flavour-chai-machine",
//     category: "Chai Machine",
//     price: 1599,
//     stock: 8,
//     status: "Active",
//     featured: true,
//     image: "/logo.png",
//     shortDescription: "Advanced chai machine with three flavour options.",
//     sku: "ADADA-CM-002",
//     specifications: [
//       "3 flavour dispensing",
//       "Fast heating",
//       "Low maintenance",
//       "Premium design",
//     ],
//   },
//   {
//     id: 3,
//     name: "Masala Chai Premix",
//     slug: "masala-chai-premix",
//     category: "Premix",
//     price: 25,
//     stock: 120,
//     status: "Active",
//     featured: false,
//     image: "/logo.png",
//     shortDescription: "Authentic masala chai premix for rich taste.",
//     sku: "ADADA-PM-001",
//     specifications: [
//       "Instant mix",
//       "Rich aroma",
//       "Easy preparation",
//       "Bulk pack available",
//     ],
//   },
// ];




// export const ordersfirstData = [
//   {
//     id: 1,
//     orderNumber: "ORD-1001",
//     customerName: "John Smith",
//     email: "john.smith@example.com",
//     phone: "+61 412 345 678",
//     date: "2026-03-10",
//     items: 3,
//     totalAmount: 149.99,
//     paymentMethod: "Stripe",
//     paymentStatus: "Paid",
//     orderStatus: "Delivered",
//     shippingAddress: "12 George Street, Sydney NSW 2000, Australia",
//   },
//   {
//     id: 2,
//     orderNumber: "ORD-1002",
//     customerName: "Emily Johnson",
//     email: "emily.johnson@example.com",
//     phone: "+61 433 221 456",
//     date: "2026-03-11",
//     items: 2,
//     totalAmount: 89.5,
//     paymentMethod: "PayPal",
//     paymentStatus: "Paid",
//     orderStatus: "Shipped",
//     shippingAddress: "45 King Street, Melbourne VIC 3000, Australia",
//   },
//   {
//     id: 3,
//     orderNumber: "ORD-1003",
//     customerName: "Michael Brown",
//     email: "michael.brown@example.com",
//     phone: "+61 401 112 334",
//     date: "2026-03-11",
//     items: 1,
//     totalAmount: 39.99,
//     paymentMethod: "Cash on Delivery",
//     paymentStatus: "Pending",
//     orderStatus: "Pending",
//     shippingAddress: "88 Adelaide Street, Brisbane QLD 4000, Australia",
//   },
//   {
//     id: 4,
//     orderNumber: "ORD-1004",
//     customerName: "Sophia Williams",
//     email: "sophia.williams@example.com",
//     phone: "+61 422 556 778",
//     date: "2026-03-12",
//     items: 5,
//     totalAmount: 229.0,
//     paymentMethod: "Card",
//     paymentStatus: "Paid",
//     orderStatus: "Processing",
//     shippingAddress: "27 St Kilda Road, Melbourne VIC 3004, Australia",
//   },
//   {
//     id: 5,
//     orderNumber: "ORD-1005",
//     customerName: "Daniel Wilson",
//     email: "daniel.wilson@example.com",
//     phone: "+61 477 889 901",
//     date: "2026-03-12",
//     items: 2,
//     totalAmount: 64.75,
//     paymentMethod: "Stripe",
//     paymentStatus: "Failed",
//     orderStatus: "Cancelled",
//     shippingAddress: "61 Main Road, Hobart TAS 7000, Australia",
//   },
//   {
//     id: 6,
//     orderNumber: "ORD-1006",
//     customerName: "Olivia Taylor",
//     email: "olivia.taylor@example.com",
//     phone: "+61 455 908 778",
//     date: "2026-03-13",
//     items: 4,
//     totalAmount: 174.25,
//     paymentMethod: "PayPal",
//     paymentStatus: "Paid",
//     orderStatus: "Delivered",
//     shippingAddress: "14 Queen Street, Perth WA 6000, Australia",
//   },
// ];


// export const transactionsfirstData = [
//   {
//     id: 1,
//     transactionId: "TXN-1001",
//     orderNumber: "ORD-1001",
//     customerName: "John Smith",
//     date: "2026-03-10",
//     amount: 149.99,
//     paymentMethod: "Stripe",
//     type: "Credit",
//     status: "Completed",
//     reference: "STRIPE-PAY-001",
//     notes: "Payment successfully captured.",
//   },
//   {
//     id: 2,
//     transactionId: "TXN-1002",
//     orderNumber: "ORD-1002",
//     customerName: "Emily Johnson",
//     date: "2026-03-11",
//     amount: 89.5,
//     paymentMethod: "PayPal",
//     type: "Credit",
//     status: "Completed",
//     reference: "PAYPAL-REF-224",
//     notes: "Customer completed payment through PayPal.",
//   },
//   {
//     id: 3,
//     transactionId: "TXN-1003",
//     orderNumber: "ORD-1003",
//     customerName: "Michael Brown",
//     date: "2026-03-11",
//     amount: 39.99,
//     paymentMethod: "Cash on Delivery",
//     type: "Debit",
//     status: "Pending",
//     reference: "COD-3321",
//     notes: "Awaiting cash collection on delivery.",
//   },
//   {
//     id: 4,
//     transactionId: "TXN-1004",
//     orderNumber: "ORD-1004",
//     customerName: "Sophia Williams",
//     date: "2026-03-12",
//     amount: 229.0,
//     paymentMethod: "Card",
//     type: "Credit",
//     status: "Completed",
//     reference: "CARD-7788",
//     notes: "Card transaction approved successfully.",
//   },
//   {
//     id: 5,
//     transactionId: "TXN-1005",
//     orderNumber: "ORD-1005",
//     customerName: "Daniel Wilson",
//     date: "2026-03-12",
//     amount: 64.75,
//     paymentMethod: "Stripe",
//     type: "Debit",
//     status: "Failed",
//     reference: "STRIPE-FAIL-908",
//     notes: "Payment failed due to insufficient balance.",
//   },
//   {
//     id: 6,
//     transactionId: "TXN-1006",
//     orderNumber: "ORD-1006",
//     customerName: "Olivia Taylor",
//     date: "2026-03-13",
//     amount: 174.25,
//     paymentMethod: "Bank Transfer",
//     type: "Refund",
//     status: "Refunded",
//     reference: "REFUND-2026-11",
//     notes: "Refund processed to customer account.",
//   },
// ];

// export const refundfirstData = [
//   {
//     id: 1,
//     refundId: "REF-1001",
//     transactionId: "TXN-1006",
//     orderNumber: "ORD-1006",
//     customerName: "Olivia Taylor",
//     date: "2026-03-13",
//     amount: 174.25,
//     refundMethod: "Bank Transfer",
//     reason: "Customer cancelled before dispatch",
//     status: "Completed",
//     reference: "REF-BANK-001",
//     notes: "Refund transferred successfully to customer bank account.",
//   },
//   {
//     id: 2,
//     refundId: "REF-1002",
//     transactionId: "TXN-1007",
//     orderNumber: "ORD-1007",
//     customerName: "Daniel Wilson",
//     date: "2026-03-14",
//     amount: 89.99,
//     refundMethod: "Stripe",
//     reason: "Duplicate payment",
//     status: "Pending",
//     reference: "REF-STRIPE-002",
//     notes: "Waiting for gateway confirmation.",
//   },
//   {
//     id: 3,
//     refundId: "REF-1003",
//     transactionId: "TXN-1008",
//     orderNumber: "ORD-1008",
//     customerName: "Sophia Williams",
//     date: "2026-03-14",
//     amount: 59.5,
//     refundMethod: "Card Reversal",
//     reason: "Damaged product received",
//     status: "Processing",
//     reference: "REF-CARD-003",
//     notes: "Refund initiated with issuing bank.",
//   },
//   {
//     id: 4,
//     refundId: "REF-1004",
//     transactionId: "TXN-1009",
//     orderNumber: "ORD-1009",
//     customerName: "Michael Brown",
//     date: "2026-03-15",
//     amount: 120.0,
//     refundMethod: "PayPal",
//     reason: "Order cancelled by customer",
//     status: "Rejected",
//     reference: "REF-PAYPAL-004",
//     notes: "Refund rejected because order already delivered and used.",
//   },
//   {
//     id: 5,
//     refundId: "REF-1005",
//     transactionId: "TXN-1010",
//     orderNumber: "ORD-1010",
//     customerName: "Emily Johnson",
//     date: "2026-03-15",
//     amount: 42.75,
//     refundMethod: "Stripe",
//     reason: "Incorrect item shipped",
//     status: "Completed",
//     reference: "REF-STRIPE-005",
//     notes: "Refund completed after warehouse verification.",
//   },
// ];

// export const customersfirstData = [
//   {
//     id: 1,
//     customerId: "CUS-1001",
//     name: "John Smith",
//     email: "john.smith@example.com",
//     phone: "+61 412 345 678",
//     status: "Active",
//     joinedDate: "2026-01-10",
//     totalOrders: 8,
//     totalSpent: 649.75,
//     address: "12 George Street, Sydney NSW 2000, Australia",
//     notes: "Frequent customer. Prefers email communication.",
//   },
//   {
//     id: 2,
//     customerId: "CUS-1002",
//     name: "Emily Johnson",
//     email: "emily.johnson@example.com",
//     phone: "+61 433 221 456",
//     status: "Active",
//     joinedDate: "2026-01-22",
//     totalOrders: 5,
//     totalSpent: 320.5,
//     address: "45 King Street, Melbourne VIC 3000, Australia",
//     notes: "Usually orders premium products.",
//   },
//   {
//     id: 3,
//     customerId: "CUS-1003",
//     name: "Michael Brown",
//     email: "michael.brown@example.com",
//     phone: "+61 401 112 334",
//     status: "Pending",
//     joinedDate: "2026-02-02",
//     totalOrders: 2,
//     totalSpent: 79.99,
//     address: "88 Adelaide Street, Brisbane QLD 4000, Australia",
//     notes: "Verification pending.",
//   },
//   {
//     id: 4,
//     customerId: "CUS-1004",
//     name: "Sophia Williams",
//     email: "sophia.williams@example.com",
//     phone: "+61 422 556 778",
//     status: "Active",
//     joinedDate: "2026-02-10",
//     totalOrders: 10,
//     totalSpent: 1029.0,
//     address: "27 St Kilda Road, Melbourne VIC 3004, Australia",
//     notes: "VIP customer.",
//   },
//   {
//     id: 5,
//     customerId: "CUS-1005",
//     name: "Daniel Wilson",
//     email: "daniel.wilson@example.com",
//     phone: "+61 477 889 901",
//     status: "Inactive",
//     joinedDate: "2026-02-18",
//     totalOrders: 1,
//     totalSpent: 64.75,
//     address: "61 Main Road, Hobart TAS 7000, Australia",
//     notes: "No recent activity.",
//   },
//   {
//     id: 6,
//     customerId: "CUS-1006",
//     name: "Olivia Taylor",
//     email: "olivia.taylor@example.com",
//     phone: "+61 455 908 778",
//     status: "Active",
//     joinedDate: "2026-03-01",
//     totalOrders: 4,
//     totalSpent: 410.25,
//     address: "14 Queen Street, Perth WA 6000, Australia",
//     notes: "Requested invoice copies by email.",
//   },
// ];




// export const customerfirstReviewsData = [
//   {
//     id: 1,
//     reviewId: "REV-1001",
//     customerName: "John Smith",
//     email: "john.smith@example.com",
//     productName: "Masala Chai Classic",
//     rating: 5,
//     status: "Published",
//     date: "2026-03-01",
//     title: "Excellent taste and quality",
//     message:
//       "The chai has a rich aroma and authentic taste. Delivery was quick and packaging was neat.",
//   },
//   {
//     id: 2,
//     reviewId: "REV-1002",
//     customerName: "Emily Johnson",
//     email: "emily.johnson@example.com",
//     productName: "Premium Ginger Chai",
//     rating: 4,
//     status: "Published",
//     date: "2026-03-03",
//     title: "Very refreshing",
//     message:
//       "Loved the ginger balance in this blend. It is smooth, refreshing, and perfect for mornings.",
//   },
//   {
//     id: 3,
//     reviewId: "REV-1003",
//     customerName: "Michael Brown",
//     email: "michael.brown@example.com",
//     productName: "Cardamom Chai Mix",
//     rating: 3,
//     status: "Pending",
//     date: "2026-03-05",
//     title: "Good but can improve",
//     message:
//       "The flavor is good overall, but I expected a slightly stronger cardamom note.",
//   },
//   {
//     id: 4,
//     reviewId: "REV-1004",
//     customerName: "Sophia Williams",
//     email: "sophia.williams@example.com",
//     productName: "Masala Chai Classic",
//     rating: 5,
//     status: "Published",
//     date: "2026-03-06",
//     title: "Highly recommended",
//     message:
//       "This is one of the best chai blends I have tried. Strong flavor, consistent quality, and great service.",
//   },
//   {
//     id: 5,
//     reviewId: "REV-1005",
//     customerName: "Daniel Wilson",
//     email: "daniel.wilson@example.com",
//     productName: "Elaichi Tea Blend",
//     rating: 2,
//     status: "Hidden",
//     date: "2026-03-08",
//     title: "Not my preference",
//     message:
//       "The product quality is fine, but the flavor profile did not suit my personal taste.",
//   },
//   {
//     id: 6,
//     reviewId: "REV-1006",
//     customerName: "Olivia Taylor",
//     email: "olivia.taylor@example.com",
//     productName: "Premium Ginger Chai",
//     rating: 4,
//     status: "Pending",
//     date: "2026-03-10",
//     title: "Nice daily tea",
//     message:
//       "Good flavor and nice packaging. I would definitely consider ordering again.",
//   },
// ];

// export const customerEnquiriesData = [
//   {
//     id: 1,
//     enquiryId: "ENQ-1001",
//     name: "John Smith",
//     email: "john.smith@example.com",
//     phone: "+61 412 345 678",
//     subject: "Bulk order enquiry",
//     status: "Open",
//     date: "2026-03-10",
//     message: "I would like to know pricing for a bulk corporate order.",
//   },
//   {
//     id: 2,
//     enquiryId: "ENQ-1002",
//     name: "Emily Johnson",
//     email: "emily.johnson@example.com",
//     phone: "+61 433 221 456",
//     subject: "Shipping delay",
//     status: "Resolved",
//     date: "2026-03-11",
//     message: "My order is delayed. Can you please share an update?",
//   },
//   {
//     id: 3,
//     enquiryId: "ENQ-1003",
//     name: "Michael Brown",
//     email: "michael.brown@example.com",
//     phone: "+61 401 112 334",
//     subject: "Product availability",
//     status: "Closed",
//     date: "2026-03-12",
//     message: "When will the ginger chai blend be restocked?",
//   },
//   {
//     id: 4,
//     enquiryId: "ENQ-1004",
//     name: "Sophia Williams",
//     email: "sophia.williams@example.com",
//     phone: "+61 422 556 778",
//     subject: "Wholesale partnership",
//     status: "Open",
//     date: "2026-03-13",
//     message: "We are interested in discussing a retail supply partnership.",
//   },
//   {
//     id: 5,
//     enquiryId: "ENQ-1005",
//     name: "Daniel Wilson",
//     email: "daniel.wilson@example.com",
//     phone: "+61 477 889 901",
//     subject: "Refund request follow-up",
//     status: "Resolved",
//     date: "2026-03-14",
//     message: "I wanted to check the status of my refund request.",
//   },
// ];










// src/constant/data.tsx

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type ProductType = {
  id: number;
  name: string;
  slug: string;
  category: string;
  categoryId: number;
  sku: string;
  supplierSku: string;
  buyPrice: number;
  sellPrice: number;
  discountPrice?: number; // Added discount price field
  discountPercentage?: number; // Added discount percentage field
  discountStartDate?: string; // Added discount start date field
  discountEndDate?: string; // Added discount end date field
  quantity: number;
  description: string;
  specifications: string;
  image: string;
  document: string;
  seoTitle: string;
  seoKeywords: string;
  seoDescription: string;
  seoRobots: string;
  status: string;
  featured: boolean;
  lastUpdated?: string;
};

// Initial Categories Data
export const categoriesData: Category[] = [
  { id: 1, name: "Tea", description: "All tea products including green tea, black tea, and herbal tea" },
  { id: 2, name: "Coffee", description: "All coffee products including beans, ground, and specialty coffee" },
  { id: 3, name: "Snacks", description: "Snacks and side items including chips, cookies, and nuts" },
  { id: 4, name: "Beverages", description: "All beverage products including juices and soft drinks" },
  { id: 5, name: "Dairy", description: "Dairy products including milk, cheese, and yogurt" },
];

// Initial Products Data
export const productData: ProductType[] = [
  {
    id: 1,
    name: "Premium Green Tea",
    slug: "premium-green-tea",
    category: "Tea",
    categoryId: 1,
    sku: "TEA-001",
    supplierSku: "SUP-TEA-001",
    buyPrice: 5.99,
    sellPrice: 12.99,
    discountPrice: 10.99, // Added discount price
    discountPercentage: 15, // Added discount percentage
    discountStartDate: "2024-03-01", // Added discount start date
    discountEndDate: "2024-03-31", // Added discount end date
    quantity: 150,
    description: "Premium organic green tea with antioxidants. Sourced from the finest tea gardens in Japan. Rich in flavor and health benefits.",
    specifications: "Organic, Caffeine content: 30mg per cup, Rich in antioxidants, 100% natural",
    image:"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
    document: "green-tea-specs.pdf",
    seoTitle: "Buy Premium Green Tea Online | Organic Green Tea",
    seoKeywords: "green tea, organic tea, healthy tea, premium tea, Japanese tea",
    seoDescription: "Shop premium organic green tea with antioxidants. Rich flavor and health benefits. Free shipping on orders over $50.",
    seoRobots: "index, follow",
    status: "Active",
    featured: true,
    lastUpdated: "2024-03-15 10:30:00"
  },
  {
    id: 2,
    name: "Classic Black Coffee",
    slug: "classic-black-coffee",
    category: "Coffee",
    categoryId: 2,
    sku: "COF-001",
    supplierSku: "SUP-COF-001",
    buyPrice: 8.99,
    sellPrice: 18.99,
    discountPrice: 15.99, // Added discount price
    discountPercentage: 16, // Added discount percentage
    discountStartDate: "2024-03-15", // Added discount start date
    discountEndDate: "2024-04-15", // Added discount end date
    quantity: 200,
    description: "Rich and bold black coffee made from 100% Arabica beans. Perfect for your morning routine.",
    specifications: "100% Arabica, Medium roast, Smooth finish, Low acidity",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
    document: "coffee-specs.pdf",
    seoTitle: "Buy Premium Black Coffee Online | Arabica Coffee Beans",
    seoKeywords: "black coffee, arabica, coffee beans, premium coffee, fresh coffee",
    seoDescription: "Rich and bold black coffee from 100% Arabica beans. Perfect for coffee lovers. Shop now!",
    seoRobots: "index, follow",
    status: "Active",
    featured: true,
    lastUpdated: "2024-03-14 14:20:00"
  },
  {
    id: 3,
    name: "Crunchy Potato Chips",
    slug: "crunchy-potato-chips",
    category: "Snacks",
    categoryId: 3,
    sku: "SNK-001",
    supplierSku: "SUP-SNK-001",
    buyPrice: 2.99,
    sellPrice: 4.99,
    discountPrice: undefined, // No discount
    discountPercentage: undefined,
    discountStartDate: undefined,
    discountEndDate: undefined,
    quantity: 500,
    description: "Crunchy salted potato chips made from fresh potatoes. Perfect snack for any occasion.",
    specifications: "Gluten-free, Non-GMO, No artificial flavors, Sea salt",
    image:"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
    document: "",
    seoTitle: "Buy Crunchy Potato Chips Online | Fresh Snacks",
    seoKeywords: "potato chips, snacks, crunchy snacks, salted chips, party snacks",
    seoDescription: "Delicious crunchy salted potato chips. Made from fresh potatoes. Perfect for parties and snacking.",
    seoRobots: "index, follow",
    status: "Active",
    featured: false,
    lastUpdated: "2024-03-13 09:15:00"
  },
  {
    id: 4,
    name: "Fresh Orange Juice",
    slug: "fresh-orange-juice",
    category: "Beverages",
    categoryId: 4,
    sku: "BEV-001",
    supplierSku: "SUP-BEV-001",
    buyPrice: 3.99,
    sellPrice: 7.99,
    discountPrice: undefined,
    discountPercentage: undefined,
    discountStartDate: undefined,
    discountEndDate: undefined,
    quantity: 100,
    description: "Freshly squeezed orange juice with no added sugar. Rich in Vitamin C.",
    specifications: "100% pure juice, No added sugar, Pasteurized, Rich in Vitamin C",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
    document: "juice-nutrition.pdf",
    seoTitle: "Buy Fresh Orange Juice Online | 100% Pure Juice",
    seoKeywords: "orange juice, fresh juice, vitamin c, pure juice, healthy drink",
    seoDescription: "Freshly squeezed orange juice with no added sugar. Rich in Vitamin C. Order now!",
    seoRobots: "index, follow",
    status: "Draft",
    featured: false,
    lastUpdated: "2024-03-12 16:45:00"
  },
  {
    id: 5,
    name: "Organic Milk",
    slug: "organic-milk",
    category: "Dairy",
    categoryId: 5,
    sku: "DRY-001",
    supplierSku: "SUP-DRY-001",
    buyPrice: 2.49,
    sellPrice: 4.99,
    discountPrice: 3.99, // Added discount price
    discountPercentage: 20, // Added discount percentage
    discountStartDate: "2024-03-20", // Added discount start date
    discountEndDate: "2024-04-20", // Added discount end date
    quantity: 80,
    description: "Organic milk from grass-fed cows. Rich in calcium and protein.",
    specifications: "Organic certified, Grass-fed, Pasteurized, Rich in calcium",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
    document: "milk-nutrition.pdf",
    seoTitle: "Buy Organic Milk Online | Grass-fed Fresh Milk",
    seoKeywords: "organic milk, fresh milk, grass-fed milk, dairy, healthy milk",
    seoDescription: "Organic milk from grass-fed cows. Rich in calcium and protein. Free delivery available.",
    seoRobots: "index, follow",
    status: "Active",
    featured: true,
    lastUpdated: "2024-03-11 11:30:00"
  }
];

// Helper function to get category by ID
export const getCategoryById = (id: number): Category | undefined => {
  return categoriesData.find(category => category.id === id);
};

// Helper function to get products by category
export const getProductsByCategory = (categoryId: number): ProductType[] => {
  return productData.filter(product => product.categoryId === categoryId);
};

// Helper function to get featured products
export const getFeaturedProducts = (): ProductType[] => {
  return productData.filter(product => product.featured && product.status === "Active");
};

// Helper function to get active products
export const getActiveProducts = (): ProductType[] => {
  return productData.filter(product => product.status === "Active");
};

// Helper function to get low stock products
export const getLowStockProducts = (threshold: number = 50): ProductType[] => {
  return productData.filter(product => product.quantity < threshold);
};

// Helper function to get products on discount
export const getProductsOnDiscount = (): ProductType[] => {
  const today = new Date().toISOString().split('T')[0];
  return productData.filter(product => 
    product.discountPrice && 
    product.discountStartDate && 
    product.discountEndDate &&
    product.discountStartDate <= today &&
    product.discountEndDate >= today
  );
};


















// Add to your existing data.tsx file

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export type OrderType = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  items: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  trackingStatus?: string;
  orderItems: OrderItem[];
};

// Initial Orders Data
export const ordersData: OrderType[] = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customerName: "Pavithan Unenthiran",
    email: "pavithanunenthiran29@gmail.com",
    phone: "123456789",
    date: "Feb 24, 2026, 08:35 AM",
    items: 4,
    totalAmount: 320719.00,
    paymentMethod: "Stripe",
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    shippingAddress: {
      address: "sivan north",
      suburb: "Albury Municipality",
      state: "NSW",
      postcode: "40000"
    },
    trackingStatus: "payment_received",
    orderItems: [
      {
        id: 1,
        productId: 101,
        productName: "Apple MacBook Air M2",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 1300.00,
        quantity: 5,
        total: 6500.00
      },
      {
        id: 2,
        productId: 102,
        productName: "Apple Watch Series 9 GPS 41mm",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 44999.00,
        quantity: 3,
        total: 134997.00
      },
      {
        id: 3,
        productId: 103,
        productName: "ASUS TUF Gaming A15",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 2300.00,
        quantity: 2,
        total: 4600.00
      },
      {
        id: 4,
        productId: 104,
        productName: "Apple AirPods Pro 2nd Gen",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 199.00,
        quantity: 2,
        total: 398.00
      }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customerName: "John Doe",
    email: "john.doe@example.com",
    phone: "987654321",
    date: "Feb 23, 2026, 02:15 PM",
    items: 2,
    totalAmount: 299.98,
    paymentMethod: "PayPal",
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    shippingAddress: {
      address: "123 Main St",
      suburb: "Sydney CBD",
      state: "NSW",
      postcode: "2000"
    },
    trackingStatus: "delivered",
    orderItems: [
      {
        id: 1,
        productId: 105,
        productName: "Wireless Headphones",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 149.99,
        quantity: 2,
        total: 299.98
      }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customerName: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "555123456",
    date: "Feb 22, 2026, 11:20 AM",
    items: 1,
    totalAmount: 899.00,
    paymentMethod: "Credit Card",
    paymentStatus: "Pending",
    orderStatus: "Processing",
    shippingAddress: {
      address: "456 Queen St",
      suburb: "Brisbane",
      state: "QLD",
      postcode: "4000"
    },
    trackingStatus: "processing",
    orderItems: [
      {
        id: 1,
        productId: 106,
        productName: "Smartphone",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        unitPrice: 899.00,
        quantity: 1,
        total: 899.00
      }
    ]
  }
];


// Add this to your existing data.tsx file

export type TransactionType = {
  id: number;
  transactionId: string;
  orderId: string;
  invoiceId: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  paidAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentDate: string;
  createdAt: string;
  lastUpdated: string;
  orderTotal: number;
};

export const transactionsData: TransactionType[] = [
  {
    id: 1,
    transactionId: "PAY26020035",
    orderId: "OR26020035",
    invoiceId: "INV-2024-001",
    paymentMethod: "stripe",
    paymentStatus: "Pending",
    orderStatus: "order_placed",
    totalAmount: 320719.00,
    paidAmount: 0.00,
    customerName: "Pavithan Unenthiran",
    customerEmail: "pavithanunenthiran29@gmail.com",
    customerPhone: "123456789",
    paymentDate: "2024-02-24",
    createdAt: "2024-02-24 14:02:58",
    lastUpdated: "2024-02-24 14:02:58",
    orderTotal: 320719.00,
  },
  {
    id: 2,
    transactionId: "PAY26020036",
    orderId: "OR26020036",
    invoiceId: "INV-2024-002",
    paymentMethod: "paypal",
    paymentStatus: "Completed",
    orderStatus: "delivered",
    totalAmount: 150.50,
    paidAmount: 150.50,
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    customerPhone: "987654321",
    paymentDate: "2024-02-23",
    createdAt: "2024-02-23 10:30:00",
    lastUpdated: "2024-02-23 10:30:00",
    orderTotal: 150.50,
  },
  {
    id: 3,
    transactionId: "PAY26020037",
    orderId: "OR26020037",
    invoiceId: "INV-2024-003",
    paymentMethod: "card",
    paymentStatus: "Failed",
    orderStatus: "payment_failed",
    totalAmount: 89.99,
    paidAmount: 0.00,
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    customerPhone: "555666777",
    paymentDate: "2024-02-22",
    createdAt: "2024-02-22 15:45:00",
    lastUpdated: "2024-02-22 15:45:00",
    orderTotal: 89.99,
  },
  {
    id: 4,
    transactionId: "PAY26020038",
    orderId: "OR26020038",
    invoiceId: "INV-2024-004",
    paymentMethod: "bank_transfer",
    paymentStatus: "Processing",
    orderStatus: "processing",
    totalAmount: 299.99,
    paidAmount: 299.99,
    customerName: "Robert Johnson",
    customerEmail: "robert@example.com",
    customerPhone: "444333222",
    paymentDate: "2024-02-21",
    createdAt: "2024-02-21 09:15:00",
    lastUpdated: "2024-02-21 09:15:00",
    orderTotal: 299.99,
  },
  {
    id: 5,
    transactionId: "PAY26020039",
    orderId: "OR26020039",
    invoiceId: "INV-2024-005",
    paymentMethod: "stripe",
    paymentStatus: "Refunded",
    orderStatus: "refunded",
    totalAmount: 45.99,
    paidAmount: 45.99,
    customerName: "Sarah Wilson",
    customerEmail: "sarah@example.com",
    customerPhone: "111222333",
    paymentDate: "2024-02-20",
    createdAt: "2024-02-20 18:20:00",
    lastUpdated: "2024-02-20 18:20:00",
    orderTotal: 45.99,
  },
  {
    id: 6,
    transactionId: "PAY26020040",
    orderId: "OR26020040",
    invoiceId: "INV-2024-006",
    paymentMethod: "paypal",
    paymentStatus: "Completed",
    orderStatus: "delivered",
    totalAmount: 560.00,
    paidAmount: 560.00,
    customerName: "Michael Brown",
    customerEmail: "michael@example.com",
    customerPhone: "999888777",
    paymentDate: "2024-02-19",
    createdAt: "2024-02-19 11:00:00",
    lastUpdated: "2024-02-19 11:00:00",
    orderTotal: 560.00,
  },
];




// src/constant/data.tsx

// Add these types to your existing types
export type RefundItem = {
  productId: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
};

export type RefundType = {
  id: number;
  refundId: string;
  orderId: string;
  orderDate: string;
  orderTotal: number;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  requestedAt: string;
  reason: string;
  status: "pending" | "refunded" | "rejected";
  items: RefundItem[];
  notes?: string;
};

// Initial Refund Data
export const refundData: RefundType[] = [
  {
    id: 1,
    refundId: "REF-001",
    orderId: "OR26020031",
    orderDate: "2/17/2026, 7:52:25 AM",
    orderTotal: 2629.00,
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    paymentMethod: "stripe",
    requestedAt: "2/17/2026, 9:49:43 AM",
    reason: "Shipping takes too long, items not delivered on time",
    status: "rejected",
    items: [
      {
        productId: 1,
        name: "Apple AirPods Pro 2nd Gen",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 199.00,
        quantity: 1,
        total: 199.00
      },
      {
        productId: 2,
        name: "Boat Airdopes 141",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 130.00,
        quantity: 1,
        total: 130.00
      },
      {
        productId: 3,
        name: "ASUS TUF Gaming A15",
        image:"https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 2300.00,
        quantity: 1,
        total: 2300.00
      }
    ],
    notes: "Customer requested refund due to delayed shipping"
  },
  {
    id: 2,
    refundId: "REF-002",
    orderId: "OR26020032",
    orderDate: "2/18/2026, 10:30:15 AM",
    orderTotal: 89.99,
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    paymentMethod: "paypal",
    requestedAt: "2/18/2026, 2:15:30 PM",
    reason: "Product damaged during shipping",
    status: "refunded",
    items: [
      {
        productId: 4,
        name: "Ceramic Coffee Mug Set",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 29.99,
        quantity: 3,
        total: 89.97
      }
    ],
    notes: "Refund processed and sent to customer"
  },
  {
    id: 3,
    refundId: "REF-003",
    orderId: "OR26020033",
    orderDate: "2/19/2026, 9:15:00 AM",
    orderTotal: 149.50,
    customerName: "Mike Johnson",
    customerEmail: "mike.j@example.com",
    paymentMethod: "credit_card",
    requestedAt: "2/19/2026, 11:30:00 AM",
    reason: "Wrong item received, received different product",
    status: "pending",
    items: [
      {
        productId: 5,
        name: "Wireless Keyboard",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 49.99,
        quantity: 1,
        total: 49.99
      },
      {
        productId: 6,
        name: "Wireless Mouse",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 29.99,
        quantity: 1,
        total: 29.99
      },
      {
        productId: 7,
        name: "USB-C Hub",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 69.52,
        quantity: 1,
        total: 69.52
      }
    ],
    notes: "Waiting for return confirmation"
  },
  {
    id: 4,
    refundId: "REF-004",
    orderId: "OR26020034",
    orderDate: "2/20/2026, 1:45:30 PM",
    orderTotal: 499.99,
    customerName: "Sarah Williams",
    customerEmail: "sarah.w@example.com",
    paymentMethod: "stripe",
    requestedAt: "2/20/2026, 3:20:00 PM",
    reason: "Product doesn't match description, missing features",
    status: "pending",
    items: [
      {
        productId: 8,
        name: "Smart Watch Pro",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 299.99,
        quantity: 1,
        total: 299.99
      },
      {
        productId: 9,
        name: "Charging Dock",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 199.99,
        quantity: 1,
        total: 199.99
      }
    ],
    notes: "Customer support contacted for verification"
  },
  {
    id: 5,
    refundId: "REF-005",
    orderId: "OR26020035",
    orderDate: "2/21/2026, 11:00:00 AM",
    orderTotal: 75.50,
    customerName: "David Brown",
    customerEmail: "david.b@example.com",
    paymentMethod: "paypal",
    requestedAt: "2/21/2026, 1:45:00 PM",
    reason: "Duplicate order, accidentally ordered twice",
    status: "refunded",
    items: [
      {
        productId: 10,
        name: "Noise Cancelling Headphones",
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
        price: 75.50,
        quantity: 1,
        total: 75.50
      }
    ],
    notes: "Refund issued for duplicate payment"
  }
];

// Helper functions for refunds
export const getRefundsByStatus = (status: string): RefundType[] => {
  return refundData.filter(refund => refund.status === status);
};

export const getPendingRefunds = (): RefundType[] => {
  return refundData.filter(refund => refund.status === "pending");
};

export const getRefundedRefunds = (): RefundType[] => {
  return refundData.filter(refund => refund.status === "refunded");
};

export const getRejectedRefunds = (): RefundType[] => {
  return refundData.filter(refund => refund.status === "rejected");
};

export const getTotalRefundAmount = (): number => {
  return refundData
    .filter(refund => refund.status === "refunded")
    .reduce((sum, refund) => sum + refund.orderTotal, 0);
};





// src/constant/data.tsx

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  status: "Active" | "Inactive" | "Pending";
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  orders: Order[];
  totalSpent: number;
  notes?: string;
};

export type Order = {
  id: number;
  orderNumber: string;
  date: string;
  status: "Delivered" | "Processing" | "Shipped" | "Cancelled";
  total: number;
  items: OrderItem2[];
};

export type OrderItem2 = {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
};

// Initial Customers Data
export const customersData: Customer[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15",
    status: "Active",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      country: "USA",
      zipCode: "10001"
    },
    totalSpent: 1245.50,
    notes: "Premium customer, prefers email communication",
    orders: [
      {
        id: 1,
        orderNumber: "ORD-001",
        date: "2024-02-10",
        status: "Delivered",
        total: 245.99,
        items: [
          { productId: 1, productName: "Premium Green Tea", quantity: 2, price: 12.99 },
          { productId: 2, productName: "Classic Black Coffee", quantity: 1, price: 18.99 }
        ]
      },
      {
        id: 2,
        orderNumber: "ORD-002",
        date: "2024-02-25",
        status: "Delivered",
        total: 189.50,
        items: [
          { productId: 3, productName: "Crunchy Potato Chips", quantity: 3, price: 4.99 },
          { productId: 4, productName: "Fresh Orange Juice", quantity: 2, price: 7.99 }
        ]
      },
      {
        id: 3,
        orderNumber: "ORD-003",
        date: "2024-03-05",
        status: "Processing",
        total: 325.75,
        items: [
          { productId: 1, productName: "Premium Green Tea", quantity: 5, price: 12.99 },
          { productId: 2, productName: "Classic Black Coffee", quantity: 3, price: 18.99 }
        ]
      }
    ]
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 234-5678",
    createdAt: "2024-01-20",
    status: "Active",
    address: {
      street: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
      zipCode: "90001"
    },
    totalSpent: 876.30,
    notes: "Regular customer, prefers SMS updates",
    orders: [
      {
        id: 4,
        orderNumber: "ORD-004",
        date: "2024-02-15",
        status: "Delivered",
        total: 156.75,
        items: [
          { productId: 5, productName: "Organic Milk", quantity: 2, price: 4.99 },
          { productId: 1, productName: "Premium Green Tea", quantity: 1, price: 12.99 }
        ]
      },
      {
        id: 5,
        orderNumber: "ORD-005",
        date: "2024-03-01",
        status: "Shipped",
        total: 98.50,
        items: [
          { productId: 3, productName: "Crunchy Potato Chips", quantity: 4, price: 4.99 }
        ]
      }
    ]
  },
  {
    id: 3,
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    phone: "+1 (555) 345-6789",
    createdAt: "2024-01-25",
    status: "Inactive",
    address: {
      street: "789 Pine Street",
      city: "Chicago",
      state: "IL",
      country: "USA",
      zipCode: "60601"
    },
    totalSpent: 432.25,
    notes: "Haven't purchased in 2 months",
    orders: [
      {
        id: 6,
        orderNumber: "ORD-006",
        date: "2024-01-30",
        status: "Delivered",
        total: 432.25,
        items: [
          { productId: 2, productName: "Classic Black Coffee", quantity: 5, price: 18.99 },
          { productId: 4, productName: "Fresh Orange Juice", quantity: 3, price: 7.99 }
        ]
      }
    ]
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 456-7890",
    createdAt: "2024-02-01",
    status: "Active",
    address: {
      street: "321 Maple Drive",
      city: "Houston",
      state: "TX",
      country: "USA",
      zipCode: "77001"
    },
    totalSpent: 1567.80,
    notes: "VIP customer, frequently buys in bulk",
    orders: [
      {
        id: 7,
        orderNumber: "ORD-007",
        date: "2024-02-05",
        status: "Delivered",
        total: 567.80,
        items: [
          { productId: 1, productName: "Premium Green Tea", quantity: 10, price: 12.99 },
          { productId: 2, productName: "Classic Black Coffee", quantity: 8, price: 18.99 }
        ]
      },
      {
        id: 8,
        orderNumber: "ORD-008",
        date: "2024-02-20",
        status: "Delivered",
        total: 450.00,
        items: [
          { productId: 5, productName: "Organic Milk", quantity: 15, price: 4.99 }
        ]
      },
      {
        id: 9,
        orderNumber: "ORD-009",
        date: "2024-03-10",
        status: "Shipped",
        total: 550.00,
        items: [
          { productId: 3, productName: "Crunchy Potato Chips", quantity: 20, price: 4.99 }
        ]
      }
    ]
  },
  {
    id: 5,
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 567-8901",
    createdAt: "2024-02-10",
    status: "Pending",
    address: {
      street: "654 Cedar Lane",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
      zipCode: "85001"
    },
    totalSpent: 0,
    notes: "New customer, waiting for first purchase",
    orders: []
  }
];

// Helper functions
export const getCustomerById = (id: number): Customer | undefined => {
  return customersData.find(customer => customer.id === id);
};

export const getCustomerOrders = (customerId: number): Order[] => {
  const customer = customersData.find(c => c.id === customerId);
  return customer?.orders || [];
};

export const getActiveCustomers = (): Customer[] => {
  return customersData.filter(customer => customer.status === "Active");
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};




// Add to src/constant/data.tsx

export type CustomerReview = {
  id: number;
  reviewId: string;
  orderId: string;
  customerName: string;
  email: string;
  productName: string;
  productId: number;
  rating: number;
  status: "approved" | "pending" | "rejected";
  date: string;
  comment: string;
  images: string[];
  adminNote?: string;
};

export const customerReviewsData: CustomerReview[] = [
  {
    id: 1,
    reviewId: "REV2602160073",
    orderId: "OR26020005",
    customerName: "Deniya Edwinraj",
    email: "deniyaedwinraj@gmail.com",
    productName: "boAt Lunar Connect Ace Smartwatch",
    productId: 101,
    rating: 4,
    status: "pending",
    date: "2026-02-16",
    comment: "Test 1 - The product is good but battery life could be better. Overall satisfied with the purchase.",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=200"
    ],
    adminNote: ""
  },
  {
    id: 2,
    reviewId: "REV2602160074",
    orderId: "OR26020006",
    customerName: "John Smith",
    email: "john.smith@example.com",
    productName: "Premium Green Tea",
    productId: 1,
    rating: 5,
    status: "approved",
    date: "2026-02-15",
    comment: "Excellent quality! The tea has a wonderful aroma and taste. Will definitely order again.",
    images: [
      "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=200"
    ],
    adminNote: "Verified purchase - Good feedback"
  },
  {
    id: 3,
    reviewId: "REV2602160075",
    orderId: "OR26020007",
    customerName: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    productName: "Classic Black Coffee",
    productId: 2,
    rating: 3,
    status: "rejected",
    date: "2026-02-14",
    comment: "The coffee is okay but the packaging was damaged during shipping.",
    images: [],
    adminNote: "Contacted customer for replacement"
  },
  {
    id: 4,
    reviewId: "REV2602160076",
    orderId: "OR26020008",
    customerName: "Mike Wilson",
    email: "mike.wilson@example.com",
    productName: "Crunchy Potato Chips",
    productId: 3,
    rating: 4,
    status: "pending",
    date: "2026-02-13",
    comment: "Very tasty chips! Perfect crunch and flavor. Will buy again.",
    images: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200"
    ],
    adminNote: ""
  },
  {
    id: 5,
    reviewId: "REV2602160077",
    orderId: "OR26020009",
    customerName: "Emma Davis",
    email: "emma.davis@example.com",
    productName: "Fresh Orange Juice",
    productId: 4,
    rating: 5,
    status: "approved",
    date: "2026-02-12",
    comment: "Fresh and natural taste! Best orange juice I've had in a while.",
    images: [
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=200",
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200"
    ],
    adminNote: "Featured review"
  }
];













