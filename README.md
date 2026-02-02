# AntiDetect Browser

Una aplicación de escritorio para navegación anti-detección con perfiles personalizados, automatización de flujos de trabajo y gestión de proxies.

## 🚀 Características Principales

### Gestión de Perfiles
- Creación y gestión de perfiles de navegador personalizados
- Huellas digitales únicas para cada perfil
- Grupos de perfiles para organización
- Importación y exportación de perfiles

### Automatización de Flujos de Trabajo
- Editor visual de flujos de trabajo
- Múltiples tipos de nodos (acciones, condiciones, bucles, esperas)
- Ejecución de flujos automatizados
- Importación y exportación de flujos

### Gestión de Proxies
- Configuración de proxies HTTP/HTTPS/SOCKS
- Grupos de proxies para rotación
- Gestión centralizada de credenciales

### Sistema de Tienda y Balance
- Tienda integrada para productos y servicios
- Sistema de balance y depósitos
- Planes de suscripción y actualizaciones

## 🏗️ Arquitectura del Proyecto

```
browser/
├── app/                          # Aplicación principal
│   ├── main.mjs                  # Proceso principal de Electron
│   ├── preload.js               # Script de preload
│   ├── package.json             # Dependencias y scripts
│   │
│   ├── backend/                  # Backend (Node.js + Express)
│   │   ├── main.ts              # Servidor principal
│   │   ├── db.ts                # Configuración de base de datos
│   │   ├── schema.ts            # Esquema de la base de datos
│   │   ├── drizzle.config.ts    # Configuración de Drizzle ORM
│   │   │
│   │   ├── controllers/         # Controladores de API
│   │   │   ├── auth.controller.ts
│   │   │   ├── profile.controller.ts
│   │   │   ├── workflow.controller.ts
│   │   │   ├── proxy.controller.ts
│   │   │   └── ...
│   │   │
│   │   ├── services/            # Lógica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── workflow.service.ts
│   │   │   ├── proxy.service.ts
│   │   │   └── ...
│   │   │
│   │   ├── models/              # Modelos de datos
│   │   │   ├── User.ts
│   │   │   ├── Profile.ts
│   │   │   ├── Workflow.ts
│   │   │   └── ...
│   │   │
│   │   ├── routes/              # Rutas de API
│   │   │   ├── auth.routes.ts
│   │   │   ├── profile.routes.ts
│   │   │   ├── workflow.routes.ts
│   │   │   └── ...
│   │   │
│   │   ├── middleware/          # Middleware
│   │   │   └── auth.middleware.ts
│   │   │
│   │   ├── workflow/            # Sistema de flujos de trabajo
│   │   │   ├── engine.ts        # Motor de ejecución
│   │   │   ├── executor.ts      # Ejecutor de flujos
│   │   │   ├── parser.ts        # Parser de flujos
│   │   │   └── handlers/         # Manejadores de nodos
│   │   │       ├── action.ts
│   │   │       ├── condition.ts
│   │   │       ├── loop.ts
│   │   │       └── ...
│   │   │
│   │   └── utils/               # Utilidades
│   │       ├── email.ts
│   │       ├── jwt.ts
│   │       └── ...
│   │
│   └── frontend/                # Frontend (React + Vite)
│       ├── src/
│       │   ├── main.tsx         # Punto de entrada
│       │   ├── App.tsx          # Componente principal
│       │   │
│       │   ├── pages/           # Páginas de la aplicación
│       │   │   ├── home-page.tsx
│       │   │   ├── profile-page.tsx
│       │   │   ├── workflow-page.tsx
│       │   │   ├── proxy-page.tsx
│       │   │   ├── store-page.tsx
│       │   │   ├── settings-page.tsx
│       │   │   └── ...
│       │   │
│       │   ├── components/      # Componentes reutilizables
│       │   │   ├── ui/          # Componentes UI base
│       │   │   ├── profile/     # Componentes de perfiles
│       │   │   └── workflow-editor/ # Editor de flujos
│       │   │       ├── index.tsx
│       │   │       ├── WorkflowList.tsx
│       │   │       ├── PropertiesPanel.tsx
│       │   │       └── NodeTypes/ # Tipos de nodos
│       │   │           ├── ActionNode.tsx
│       │   │           ├── ConditionNode.tsx
│       │   │           └── ...
│       │   │
│       │   ├── hooks/           # Hooks personalizados
│       │   │   ├── useAuth.tsx
│       │   │   ├── useProfile.tsx
│       │   │   ├── useWorkflow.tsx
│       │   │   └── ...
│       │   │
│       │   ├── services/        # Servicios de API
│       │   │   ├── AuthFunctionalService.ts
│       │   │   ├── ProfileFunctionalService.ts
│       │   │   ├── WorkflowFunctionalService.ts
│       │   │   └── ...
│       │   │
│       │   ├── context/         # Contextos de React
│       │   │   ├── WorkflowContext.tsx
│       │   │   └── BalanceContext.tsx
│       │   │
│       │   └── utils/           # Utilidades del frontend
│       │       ├── settings.ts
│       │       └── error-utils.ts
│       │
│       ├── package.json         # Dependencias del frontend
│       └── dist/                # Build de producción
│
└── README.md                    # Este archivo
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Drizzle ORM** - ORM para la base de datos
- **Better SQLite3** - Base de datos SQL
- **TypeScript** - Tipado estático
- **JWT** - Autenticación
- **Playwright** - Automatización de navegador

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS
- **Wouter** - Enrutamiento
- **React Query** - Gestión de estado del servidor

### Desktop
- **Electron** - Framework de aplicaciones de escritorio
- **Electron Builder** - Empaquetado y distribución

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd browser
cd app
```

2. Instalar dependencias:
```bash
npm install
```

3. Reconstruir módulos nativos:
```bash
npm run postinstall
```

## 🚀 Desarrollo

### Modo Desarrollo
```bash
# Iniciar backend y frontend en modo desarrollo
npm run dev
```

### Build de Producción
```bash
# Construir aplicación completa
npm run build

# O construir por separado:
npm run build:frontend
npm run build:backend
```

### Empaquetado
```bash
# Crear paquete para distribución
npm run dist
```

## 🔧 Scripts Disponibles

- `npm start` - Iniciar aplicación en modo producción
- `npm run dev` - Iniciar en modo desarrollo
- `npm run backend` - Iniciar solo el backend
- `npm run frontend` - Construir frontend
- `npm run build` - Construir aplicación completa
- `npm run pack` - Empaquetar sin firmar
- `npm run dist` - Crear distributible completo

## 📁 Estructura de Datos

### Perfiles
- Huellas digitales únicas
- Configuración de navegador personalizada
- Datos de sesión persistentes

### Flujos de Trabajo
- Editor visual basado en nodos
- Ejecución automatizada
- Gestión de variables y condiciones

### Proxies
- Configuración múltiple
- Rotación automática
- Gestión de credenciales

## 🔒 Seguridad

- Autenticación JWT
- Encriptación de datos sensibles
- Aislamiento de sesiones de navegador
- Validación de inputs en todos los endpoints

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles

## 🆘 Soporte

Para reportar issues o solicitar ayuda, abrir un issue en el repositorio.
