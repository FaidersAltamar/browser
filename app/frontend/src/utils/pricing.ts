import { Package, PackageType, PricingTier, SubscriptionPeriod } from '../types/upgrade';

// Cloud packages
export const CLOUD_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'cloud',
    name: 'Cloud Básico',
    description: 'Solución cloud simple para usuarios individuales',
    recommendedFor: 'Principiantes',
    features: [
      'Máximo 5 perfiles de navegador',
      'Configuración básica Anti Detect',
      'Protección básica de huella digital',
      'Soporte Email básico',
    ],
    minMembers: 1,
    maxMembers: 5,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 9.99,
        totalPrice: 9.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 8.99,
        totalPrice: 53.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 7.99,
        totalPrice: 95.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'cloud',
    name: 'Cloud Avanzado',
    description: 'Solución cloud potente para usuarios serios',
    recommendedFor: 'Usuarios frecuentes',
    features: [
      'Máximo 15 perfiles de navegador',
      'Configuración avanzada Anti Detect',
      'Protección avanzada de huella digital',
      'Proxy integrado',
      'Soporte Email prioritario',
    ],
    minMembers: 1,
    maxMembers: 15,
    defaultMembers: 3,
    pricingOptions: {
      1: {
        monthlyPrice: 19.99,
        totalPrice: 19.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 17.99,
        totalPrice: 107.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 15.99,
        totalPrice: 191.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'premium',
    type: 'cloud',
    name: 'Cloud Premium',
    description: 'Solución cloud premium para profesionales',
    recommendedFor: 'Profesionales y pequeñas empresas',
    features: [
      'Máximo 50 perfiles de navegador',
      'Configuración profunda Anti Detect',
      'Protección integral de huella digital',
      'Proxy integrado premium',
      'Soporte 24/7',
      'Análisis de datos',
    ],
    minMembers: 1,
    maxMembers: 50,
    defaultMembers: 5,
    pricingOptions: {
      1: {
        monthlyPrice: 39.99,
        totalPrice: 39.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 35.99,
        totalPrice: 215.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 31.99,
        totalPrice: 383.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'cloud',
    name: 'Cloud Empresarial',
    description: 'Solución cloud integral para grandes empresas',
    recommendedFor: 'Grandes empresas',
    features: [
      'Perfiles de navegador ilimitados',
      'Configuración profunda Anti Detect',
      'Protección de huella digital de nivel superior',
      'Proxy integrado premium',
      'Soporte 24/7 prioritario',
      'Análisis de datos avanzado',
      'Personalización según requerimientos',
      'Gestión de cuenta especializada',
    ],
    minMembers: 10,
    maxMembers: 100,
    defaultMembers: 20,
    pricingOptions: {
      1: {
        monthlyPrice: 99.99,
        totalPrice: 99.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 89.99,
        totalPrice: 539.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 79.99,
        totalPrice: 959.88,
        discount: 20,
      },
    },
  },
];

// Local packages
export const LOCAL_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'local',
    name: 'Local Básico',
    description: 'Solución local simple para usuarios individuales',
    recommendedFor: 'Principiantes',
    features: [
      'Máximo 5 perfiles de navegador',
      'Configuración básica Anti Detect',
      'Protección básica de huella digital',
      'Almacenamiento de datos local',
      'Soporte Email básico',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 7.99,
        totalPrice: 7.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 6.99,
        totalPrice: 41.94,
        discount: 12,
      },
      12: {
        monthlyPrice: 5.99,
        totalPrice: 71.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'local',
    name: 'Local Avanzado',
    description: 'Solución local potente para usuarios serios',
    recommendedFor: 'Usuarios frecuentes',
    features: [
      'Máximo 15 perfiles de navegador',
      'Configuración avanzada Anti Detect',
      'Protección avanzada de huella digital',
      'Almacenamiento de datos local seguro',
      'Soporte Email prioritario',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 15.99,
        totalPrice: 15.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 13.99,
        totalPrice: 83.94,
        discount: 12,
      },
      12: {
        monthlyPrice: 11.99,
        totalPrice: 143.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'premium',
    type: 'local',
    name: 'Local Premium',
    description: 'Solución local premium para profesionales',
    recommendedFor: 'Profesionales y pequeñas empresas',
    features: [
      'Máximo 50 perfiles de navegador',
      'Configuración profunda Anti Detect',
      'Protección integral de huella digital',
      'Cifrado de datos local',
      'Soporte 24/7',
      'Análisis de datos',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 29.99,
        totalPrice: 29.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 26.39,
        totalPrice: 158.34,
        discount: 12,
      },
      12: {
        monthlyPrice: 22.49,
        totalPrice: 269.88,
        discount: 25,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'local',
    name: 'Local Empresarial',
    description: 'Solución local integral para grandes empresas',
    recommendedFor: 'Grandes empresas',
    features: [
      'Perfiles de navegador ilimitados',
      'Configuración profunda Anti Detect',
      'Protección de huella digital de nivel superior',
      'Cifrado de datos local empresarial',
      'Soporte 24/7 prioritario',
      'Análisis de datos avanzado',
      'Personalización según requerimientos',
      'Gestión de cuenta especializada',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 79.99,
        totalPrice: 79.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 70.39,
        totalPrice: 422.34,
        discount: 12,
      },
      12: {
        monthlyPrice: 59.99,
        totalPrice: 719.88,
        discount: 25,
      },
    },
  },
];

// Custom packages
export const CUSTOM_PACKAGES: Package[] = [
  {
    tier: 'basic',
    type: 'custom',
    name: 'Personalizado Básico',
    description: 'Solución personalizada básica según necesidades',
    recommendedFor: 'Usuarios con necesidades especiales',
    features: [
      'Opciones de configuración del navegador',
      'Opciones de optimización',
      'Opciones de almacenamiento de datos',
      'Soporte Email personalizado',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 14.99,
        totalPrice: 14.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 13.49,
        totalPrice: 80.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 11.99,
        totalPrice: 143.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'advanced',
    type: 'custom',
    name: 'Personalizado Avanzado',
    description: 'Solución personalizada avanzada según necesidades',
    recommendedFor: 'Usuarios profesionales',
    features: [
      'Opciones de configuración avanzada del navegador',
      'Opciones de optimización avanzada',
      'Opciones de almacenamiento y seguridad',
      'Opciones de proxy',
      'Soporte Email prioritario',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 24.99,
        totalPrice: 24.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 22.49,
        totalPrice: 134.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 19.99,
        totalPrice: 239.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'premium',
    type: 'custom',
    name: 'Personalizado Premium',
    description: 'Solución personalizada premium integral',
    recommendedFor: 'Profesionales y empresas',
    features: [
      'Opciones ilimitadas para navegador',
      'Opciones de optimización premium',
      'Opciones avanzadas de almacenamiento y seguridad',
      'Opciones de proxy premium',
      'Soporte 24/7',
      'Opciones de análisis de datos',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 49.99,
        totalPrice: 49.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 44.99,
        totalPrice: 269.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 39.99,
        totalPrice: 479.88,
        discount: 20,
      },
    },
  },
  {
    tier: 'enterprise',
    type: 'custom',
    name: 'Personalizado Empresarial',
    description: 'Solución personalizada perfecta para empresas',
    recommendedFor: 'Grandes empresas y organizaciones',
    features: [
      'Opciones ilimitadas para todas las funciones',
      'Opciones de optimización especiales',
      'Opciones de seguridad empresarial',
      'Opciones de proxy empresarial',
      'Soporte 24/7 prioritario',
      'Opciones avanzadas de análisis de datos',
      'Personalización de API',
      'Gestión de cuenta especializada',
    ],
    minMembers: 1,
    maxMembers: 1,
    defaultMembers: 1,
    pricingOptions: {
      1: {
        monthlyPrice: 129.99,
        totalPrice: 129.99,
        discount: 0,
      },
      6: {
        monthlyPrice: 116.99,
        totalPrice: 701.94,
        discount: 10,
      },
      12: {
        monthlyPrice: 103.99,
        totalPrice: 1247.88,
        discount: 20,
      },
    },
  },
];

export const getAllPackages = (): Package[] => {
  return [...CLOUD_PACKAGES, ...LOCAL_PACKAGES, ...CUSTOM_PACKAGES];
};

export const getPackagesByType = (type: PackageType): Package[] => {
  switch (type) {
    case 'cloud':
      return CLOUD_PACKAGES;
    case 'local':
      return LOCAL_PACKAGES;
    case 'custom':
      return CUSTOM_PACKAGES;
    default:
      return [];
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount * 23000); // Convert USD to VND (approximate)
};

export const formatSubscriptionPeriod = (period: SubscriptionPeriod): string => {
  return period === 1 ? '1 mes' : `${period} meses`;
};