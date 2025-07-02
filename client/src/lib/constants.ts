import React from 'react';
import {
  Package,
  Database,
  Shield,
  Users,
  Globe,
  Mail,
  Bell,
  MessageSquare,
  CreditCard,
  Search,
  BarChart,
  ShoppingCart,
  Cloud,
  Layers,
  Zap,
  FileText,
  Image,
  Calendar,
  MapPin,
  Hash,
  GitBranch,
  Phone,
  CheckCircle,
  Clock,
  Archive,
  Activity,
  Key,
  User,
  Crown,
  Lock,
  Wifi,
  Radio,
  DollarSign,
  Send,
} from 'lucide-react';
import { ServiceTemplate, FeatureCategory } from './types';

export const serviceTemplates: {
  category: string;
  services: ServiceTemplate[];
}[] = [
  {
    category: 'Core Services',
    services: [
      {
        id: 'api-gateway',
        name: 'API Gateway',
        icon: Globe,
        features: ['swagger', 'validation', 'rate-limiting'],
        description: 'Central entry point for all API requests',
        color: 'from-blue-500 to-blue-600',
      },
      {
        id: 'auth',
        name: 'Authentication',
        icon: Shield,
        features: ['auth:jwt', 'database:mongodb'],
        description: 'Handle user authentication and authorization',
        color: 'from-purple-500 to-purple-600',
      },
      {
        id: 'users',
        name: 'User Management',
        icon: Users,
        features: ['users:mongodb', 'database:mongodb'],
        description: 'Manage user profiles and data',
        color: 'from-green-500 to-green-600',
      },
    ],
  },
  {
    category: 'Communication',
    services: [
      {
        id: 'notification',
        name: 'Notification',
        icon: Bell,
        features: ['email', 'push-notifications', 'sms'],
        description: 'Send notifications via multiple channels',
        color: 'from-orange-500 to-orange-600',
      },
      {
        id: 'messaging',
        name: 'Messaging',
        icon: MessageSquare,
        features: ['websocket', 'chat', 'database:mongodb'],
        description: 'Real-time messaging and chat',
        color: 'from-pink-500 to-pink-600',
      },
      {
        id: 'email',
        name: 'Email Service',
        icon: Mail,
        features: ['email-templates', 'smtp', 'sendgrid'],
        description: 'Email sending and management',
        color: 'from-indigo-500 to-indigo-600',
      },
    ],
  },
  {
    category: 'Business Logic',
    services: [
      {
        id: 'payment',
        name: 'Payment',
        icon: CreditCard,
        features: ['stripe', 'paypal', 'webhooks'],
        description: 'Process payments and subscriptions',
        color: 'from-emerald-500 to-emerald-600',
      },
      {
        id: 'search',
        name: 'Search',
        icon: Search,
        features: ['elasticsearch', 'full-text-search'],
        description: 'Advanced search capabilities',
        color: 'from-yellow-500 to-yellow-600',
      },
      {
        id: 'analytics',
        name: 'Analytics',
        icon: BarChart,
        features: ['events', 'metrics', 'database:postgresql'],
        description: 'Track and analyze user behavior',
        color: 'from-cyan-500 to-cyan-600',
      },
      {
        id: 'cart',
        name: 'Shopping Cart',
        icon: ShoppingCart,
        features: ['cart-management', 'database:redis'],
        description: 'E-commerce cart functionality',
        color: 'from-rose-500 to-rose-600',
      },
    ],
  },
  {
    category: 'Infrastructure',
    services: [
      {
        id: 'storage',
        name: 'File Storage',
        icon: Cloud,
        features: ['s3', 'file-upload', 'image-processing'],
        description: 'Handle file uploads and storage',
        color: 'from-slate-500 to-slate-600',
      },
      {
        id: 'queue',
        name: 'Queue Service',
        icon: Layers,
        features: ['rabbitmq', 'job-processing'],
        description: 'Async job processing',
        color: 'from-violet-500 to-violet-600',
      },
      {
        id: 'cache',
        name: 'Caching',
        icon: Zap,
        features: ['redis', 'cache-manager'],
        description: 'High-performance caching layer',
        color: 'from-amber-500 to-amber-600',
      },
      {
        id: 'logger',
        name: 'Logging',
        icon: FileText,
        features: ['winston', 'log-aggregation'],
        description: 'Centralized logging service',
        color: 'from-teal-500 to-teal-600',
      },
    ],
  },
];

export const availableFeatures: FeatureCategory[] = [
  {
    category: 'Common',
    icon: Package,
    items: [
      {
        name: 'cors',
        description:
          'Cross-Origin Resource Sharing (CORS) middleware that handles preflight requests and configures HTTP headers to enable secure cross-origin communication. Includes support for credentials, custom headers, and origin validation with whitelist/blacklist capabilities.',
        useCase:
          'Essential for APIs serving web applications from different domains. Configure when your frontend (React, Vue, Angular) runs on localhost:3000 while your API runs on localhost:8000, or when serving multiple client applications from different subdomains. Prevents CORS-related browser security errors.',
        icon: Globe,
      },
      {
        name: 'helmet',
        description:
          'Comprehensive security middleware that sets 15+ HTTP security headers including Content Security Policy (CSP), X-Frame-Options, X-XSS-Protection, and HSTS. Protects against XSS attacks, clickjacking, MIME sniffing, and other web vulnerabilities with configurable security policies.',
        useCase:
          'Critical for production applications handling sensitive data. Automatically hardens your API against common web attacks. Essential for compliance with security standards (OWASP, PCI DSS) and when serving applications that handle user authentication, payments, or personal information.',
        icon: Shield,
      },
      {
        name: 'swagger',
        description:
          'OpenAPI 3.0 specification generator that automatically creates interactive API documentation from your NestJS decorators and DTOs. Includes request/response schemas, authentication flows, example requests, and a built-in testing interface with support for multiple environments.',
        useCase:
          'Invaluable for API-first development and team collaboration. Auto-generates documentation that stays in sync with your code, reducing maintenance overhead. Perfect for onboarding new developers, client SDK generation, and providing external partners with comprehensive API references.',
        icon: FileText,
      },
      {
        name: 'validation',
        description:
          'Robust request validation using class-validator and class-transformer with decorator-based validation rules. Supports nested validation, custom validators, conditional validation, transformation pipes, and detailed error messages with field-level validation feedback.',
        useCase:
          'Ensures data integrity and prevents invalid data from reaching your business logic. Essential for user registration forms, API endpoints accepting complex objects, file uploads with metadata, and any scenario where data quality is critical. Reduces 70% of common runtime errors.',
        icon: CheckCircle,
      },
      {
        name: 'rate-limiting',
        description:
          'Advanced request throttling system supporting multiple algorithms (token bucket, sliding window, fixed window) with Redis backing for distributed applications. Includes IP-based, user-based, and endpoint-specific limits with customizable responses and bypass mechanisms.',
        useCase:
          'Protects your API from abuse, DDoS attacks, and resource exhaustion. Essential for public APIs, authentication endpoints, and resource-intensive operations like file uploads or AI processing. Implement different limits for authenticated vs anonymous users, and premium vs free tiers.',
        icon: Clock,
      },
      {
        name: 'compression',
        description:
          'HTTP response compression middleware supporting gzip, deflate, and brotli algorithms with intelligent content-type detection. Automatically compresses JSON responses, static assets, and large payloads while preserving headers and maintaining streaming support for real-time data.',
        useCase:
          'Dramatically reduces bandwidth usage and improves response times, especially for mobile users and slow connections. Critical for APIs returning large datasets, file downloads, or serving static content. Can reduce response sizes by 60-80% for text-based content.',
        icon: Archive,
      },
      {
        name: 'health-check',
        description: 'Application health monitoring endpoints',
        useCase: 'Monitor app status for load balancers and monitoring tools',
        icon: Activity,
      },
    ],
  },
  {
    category: 'Database',
    icon: Database,
    items: [
      {
        name: 'database:mongodb',
        description: 'MongoDB database integration',
        useCase:
          'Perfect for applications with flexible, evolving schemas like content management systems, e-commerce catalogs, user-generated content platforms, and IoT data collection. Ideal when you need horizontal scaling, geospatial queries, or handling of unstructured data like logs and analytics.',
        icon: Database,
      },
      {
        name: 'database:postgres',
        description: 'PostgreSQL database integration',
        useCase:
          'Ideal for applications requiring ACID compliance, complex relationships, and advanced SQL features. Perfect for financial systems, inventory management, CRM platforms, and applications with strict data consistency requirements. Excellent for analytics and reporting with complex queries.',
        icon: Database,
      },
      {
        name: 'database:mysql',
        description: 'MySQL database integration',
        useCase: 'Popular relational database management system',
        icon: Database,
      },
      {
        name: 'typeorm',
        description: 'TypeScript ORM for SQL databases',
        useCase: 'Type-safe database operations with decorators',
      },
      {
        name: 'mongoose',
        description: 'MongoDB object modeling for Node.js',
        useCase: 'Schema-based solution for MongoDB with validation',
      },
      {
        name: 'prisma',
        description: 'Next-generation ORM for Node.js',
        useCase: 'Type-safe database client with auto-generated queries',
        icon: Layers,
      },
    ],
  },
  {
    category: 'Authentication',
    icon: Shield,
    items: [
      {
        name: 'auth:jwt',
        description:
          'Comprehensive JWT authentication system with access/refresh token rotation, configurable expiration times, and secure signing algorithms (RS256, HS256). Includes token blacklisting, automatic renewal, and integration with role-based access control for stateless authentication.',
        useCase:
          'Perfect for microservices, mobile applications, and SPAs requiring stateless authentication. Essential for APIs serving multiple client types, distributed systems, and applications needing offline capability. Ideal when you need scalable authentication without server-side session storage.',
        icon: Key,
      },
      {
        name: 'auth:google',
        description: 'Google OAuth integration',
        useCase: 'Allow users to sign in with Google accounts',
        icon: Shield,
      },
      {
        name: 'auth:facebook',
        description: 'Facebook OAuth integration',
        useCase: 'Allow users to sign in with Facebook accounts',
        icon: Shield,
      },
      {
        name: 'auth:github',
        description: 'GitHub OAuth integration',
        useCase: 'Allow users to sign in with GitHub accounts',
        icon: Shield,
      },
      {
        name: 'auth:twitter',
        description: 'Twitter OAuth integration',
        useCase: 'Allow users to sign in with Twitter accounts',
        icon: Shield,
      },
    ],
  },
  {
    category: 'User Management',
    icon: Users,
    items: [
      {
        name: 'users:mongodb',
        description: 'Complete user management system with MongoDB backend.',
        useCase:
          'Perfect for applications with flexible user data requirements, social features, and evolving user schemas. Ideal for startups and applications where user data structure might change frequently, requiring horizontal scaling, or handling diverse user types with different attributes.',
        icon: User,
      },
      {
        name: 'users:postgres',
        description: 'Complete user management system with PostgreSQL backend.',
        useCase:
          'Essential for enterprise applications, financial systems, and platforms requiring strict data consistency and complex user relationships. Perfect for applications with detailed user analytics, compliance requirements, and sophisticated user management workflows.',
        icon: User,
      },
      {
        name: 'roles:mongodb',
        description: 'Role-based access control with MongoDB',
        useCase: 'Manage user roles with MongoDB',
        icon: Crown,
      },
      {
        name: 'roles:postgres',
        description: 'Role-based access control with PostgreSQL',
        useCase: 'Manage user roles with PostgreSQL',
        icon: Crown,
      },
      {
        name: 'permissions:mongodb',
        description: 'Permission system with MongoDB',
        useCase: 'Fine-grained access control with MongoDB',
        icon: Lock,
      },
      {
        name: 'permissions:postgres',
        description: 'Permission system with PostgreSQL',
        useCase: 'Fine-grained access control with PostgreSQL',
        icon: Lock,
      },
    ],
  },
  {
    category: 'Communication',
    icon: Mail,
    items: [
      {
        name: 'email',
        description: 'Email sending capabilities',
        useCase: 'Send transactional and marketing emails',
        icon: Mail,
      },
      {
        name: 'sms',
        description: 'SMS messaging integration',
        useCase: 'Send SMS notifications and verification codes',
        icon: MessageSquare,
      },
      {
        name: 'push-notifications',
        description: 'Push notification service',
        useCase: 'Send push notifications to mobile and web apps',
        icon: Bell,
      },
      {
        name: 'websocket',
        description: 'WebSocket real-time communication',
        useCase: 'Real-time bidirectional communication',
        icon: Wifi,
      },
      {
        name: 'socket.io',
        description: 'Socket.IO real-time engine',
        useCase: 'Real-time communication with fallbacks',
        icon: Radio,
      },
    ],
  },
  {
    category: 'Integration',
    icon: GitBranch,
    items: [
      {
        name: 'stripe',
        description: 'Stripe payment integration',
        useCase: 'Accept online payments and manage subscriptions',
        icon: CreditCard,
      },
      {
        name: 'paypal',
        description: 'PayPal payment integration',
        useCase: 'Accept PayPal payments and process transactions',
        icon: DollarSign,
      },
      {
        name: 'sendgrid',
        description: 'SendGrid email service',
        useCase: 'Reliable email delivery with analytics',
        icon: Send,
      },
      {
        name: 'twilio',
        description: 'Twilio communication platform',
        useCase: 'SMS, voice, and video communication services',
        icon: Phone,
      },
      {
        name: 's3',
        description: 'AWS S3 file storage',
        useCase: 'Scalable file storage and retrieval',
        icon: Cloud,
      },
    ],
  },
];

export const userFieldOptions = {
  authentication: [
    {
      id: 'email',
      label: 'Email',
      icon: React.createElement(Mail, { className: 'w-4 h-4' }),
      required: true,
    },
    {
      id: 'username',
      label: 'Username',
      icon: React.createElement(Users, { className: 'w-4 h-4' }),
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: React.createElement(Phone, { className: 'w-4 h-4' }),
    },
    {
      id: 'password',
      label: 'Password',
      icon: React.createElement(Shield, { className: 'w-4 h-4' }),
      required: true,
    },
  ],
  profile: [
    {
      id: 'firstName',
      label: 'First Name',
      icon: React.createElement(Users, { className: 'w-4 h-4' }),
    },
    {
      id: 'lastName',
      label: 'Last Name',
      icon: React.createElement(Users, { className: 'w-4 h-4' }),
    },
    {
      id: 'displayName',
      label: 'Display Name',
      icon: React.createElement(Users, { className: 'w-4 h-4' }),
    },
    {
      id: 'avatar',
      label: 'Avatar',
      icon: React.createElement(Image, { className: 'w-4 h-4' }),
    },
    {
      id: 'bio',
      label: 'Bio',
      icon: React.createElement(FileText, { className: 'w-4 h-4' }),
    },
    {
      id: 'dateOfBirth',
      label: 'Date of Birth',
      icon: React.createElement(Calendar, { className: 'w-4 h-4' }),
    },
    {
      id: 'address',
      label: 'Address',
      icon: React.createElement(MapPin, { className: 'w-4 h-4' }),
    },
    {
      id: 'company',
      label: 'Company',
      icon: React.createElement(Package, { className: 'w-4 h-4' }),
    },
    {
      id: 'jobTitle',
      label: 'Job Title',
      icon: React.createElement(Hash, { className: 'w-4 h-4' }),
    },
  ],
};

export const userFeatureOptions = {
  emailVerification: 'Email Verification',
  passwordReset: 'Password Reset',
  twoFactorAuth: 'Two-Factor Authentication',
  accountLocking: 'Account Locking',
  sessionManagement: 'Session Management',
  activityLogging: 'Activity Logging',
  profilePrivacy: 'Profile Privacy Settings',
  dataExport: 'Data Export (GDPR)',
  accountDeletion: 'Account Deletion',
};

export const socialLoginProviders = [
  'google',
  'facebook',
  'github',
  'twitter',
  'linkedin',
  'apple',
];
