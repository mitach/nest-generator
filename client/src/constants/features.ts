import { FeatureConfig, ServiceConfig } from "@/types/project";

export const FEATURE_CATEGORIES = {
  COMMON: "Common Features",
  DATABASE: "Database",
  AUTH: "Authentication",
  USER_MANAGEMENT: "User Management",
} as const;

export const COMMON_FEATURES: FeatureConfig[] = [
  { id: "cors", name: "cors", available: true },
  { id: "helmet", name: "helmet", available: true },
  { id: "swagger", name: "swagger", available: true },
  { id: "validation", name: "validation", available: true },
  { id: "rate-limiting", name: "rate-limiting", available: false },
];

export const DATABASE_FEATURES: FeatureConfig[] = [
  { id: "database:mongodb", name: "database:mongodb", available: true },
  { id: "database:postgresql", name: "database:postgresql", available: true },
  { id: "database:mysql", name: "database:mysql", available: false },
];

export const AUTH_FEATURES: FeatureConfig[] = [
  { id: "auth:jwt", name: "auth:jwt", available: true },
  { id: "auth:google", name: "auth:google", available: true },
  { id: "auth:facebook", name: "auth:facebook", available: false },
  { id: "roles", name: "roles", available: true },
];

export const USER_FEATURES: FeatureConfig[] = [
  { id: "users:mongodb", name: "users:mongodb", available: true },
  { id: "users:postgresql", name: "users:postgresql", available: true },
  { id: "users:mysql", name: "users:mysql", available: false },
];

export const MICROSERVICE_TEMPLATES: ServiceConfig[] = [
  { id: "api-gateway", name: "api-gateway", available: true },
  { id: "auth", name: "auth", available: true },
  { id: "users", name: "users", available: true },
  { id: "products", name: "products", available: false },
  { id: "orders", name: "orders", available: false },
  { id: "notifications", name: "notifications", available: false },
];

// Service-specific feature category mappings
export const SERVICE_FEATURE_CATEGORIES: Record<string, string[]> = {
  "api-gateway": [
    FEATURE_CATEGORIES.COMMON,
  ],
  auth: [
    FEATURE_CATEGORIES.COMMON,
    FEATURE_CATEGORIES.DATABASE,
    FEATURE_CATEGORIES.AUTH,
  ],
  users: [
    FEATURE_CATEGORIES.COMMON,
    FEATURE_CATEGORIES.DATABASE,
    FEATURE_CATEGORIES.USER_MANAGEMENT,
  ],
  products: [FEATURE_CATEGORIES.COMMON, FEATURE_CATEGORIES.DATABASE],
  orders: [FEATURE_CATEGORIES.COMMON, FEATURE_CATEGORIES.DATABASE],
  notifications: [FEATURE_CATEGORIES.COMMON, FEATURE_CATEGORIES.DATABASE],
};

// Helper function to get allowed categories for a service
export const getAllowedCategoriesForService = (
  serviceName: string
): string[] => {
  return SERVICE_FEATURE_CATEGORIES[serviceName] || [FEATURE_CATEGORIES.COMMON];
};

// Helper function to get features for a specific category
export const getFeaturesByCategory = (category: string): FeatureConfig[] => {
  switch (category) {
    case FEATURE_CATEGORIES.COMMON:
      return COMMON_FEATURES;
    case FEATURE_CATEGORIES.DATABASE:
      return DATABASE_FEATURES;
    case FEATURE_CATEGORIES.AUTH:
      return AUTH_FEATURES;
    case FEATURE_CATEGORIES.USER_MANAGEMENT:
      return USER_FEATURES;
    default:
      return [];
  }
};
