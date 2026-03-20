# Slam — Angular + Supabase

Proyecto Angular con backend en Supabase.

## Configuración inicial

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia las credenciales en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseAnonKey: 'tu-anon-key',
};
```

3. Instala dependencias y arranca:

```bash
npm install
ng serve
```

## Estructura

```
src/app/
├── core/                  # Singleton services, guards, interceptors
│   ├── services/
│   │   ├── supabase.service.ts   # Cliente Supabase
│   │   └── auth.service.ts       # Autenticación reactiva
│   ├── guards/
│   │   ├── auth.guard.ts         # Protege rutas privadas
│   │   └── guest.guard.ts        # Protege rutas de invitado
│   └── interceptors/
│       └── auth.interceptor.ts   # Inyecta JWT en peticiones HTTP
├── features/
│   ├── auth/              # Login, Register, Forgot Password
│   └── dashboard/         # Shell principal (requiere auth)
└── shared/                # Módulos y componentes reutilizables
```

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Angular |
| Backend | Supabase (DB, Auth, Storage, Edge Functions) |
| Estilos | SCSS |
