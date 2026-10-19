# Tolosano - Ferretería & Cerrajería (Etapa 2: Backend & Base de Datos)

En esta **Etapa 2**, se implementó el Backend completo con **Node.js, Express, TypeScript, Prisma ORM y PostgreSQL en Docker**, y se realizó la integración Front-Back en el Frontend reemplazando los mocks de memoria por peticiones HTTP mediante el patrón `apiFetch`.

---

## 🏗️ Arquitectura del Backend (`backend/`)

```
backend/
├── docker-compose.yml        # Orquestación de PostgreSQL 16 Alpine
├── .env                      # Variables de entorno (PORT, DATABASE_URL, CORS_ORIGIN)
├── package.json              # Express, Prisma, TypeScript, TSX, CORS
├── tsconfig.json             # Configuración TypeScript para Node.js
├── prisma/
│   ├── schema.prisma         # Modelos: Product, Sale, SaleItem, WorkOrder
│   └── seed.ts               # Semilla inicial con productos, ventas y órdenes reales
└── src/
    ├── lib/
    │   └── prisma.ts         # Instancia singleton de PrismaClient
    ├── middlewares/
    │   └── errorHandler.ts   # Manejo centralizado de errores (400, 404, 409, 500)
    ├── controllers/
    │   ├── productController.ts   # CRUD y ajuste rápido de stock
    │   ├── saleController.ts      # Transacción atómica: registra venta y descuenta stock
    │   ├── workOrderController.ts # Gestión de taller, estados y saldos
    │   └── dashboardController.ts # Métricas y recaudación diaria
    ├── routes/
    │   ├── productRoutes.ts
    │   ├── saleRoutes.ts
    │   ├── workOrderRoutes.ts
    │   ├── dashboardRoutes.ts
    │   └── index.ts          # Enrutador centralizado bajo /api
    └── server.ts             # Servidor Express con CORS, JSON y Healthcheck
```

---

## 🗄️ Modelo Relacional de Datos (`schema.prisma`)

Mapeado 1:1 con las interfaces de `src/types/index.ts`:

1. **`Product` (`products`):**
   - `id`: UUID (Primary Key)
   - `sku`: Código único de barras / artículo (`@unique`)
   - `name`, `category`, `description`
   - `costPrice`, `salePrice`, `stock`, `minStock`
   - Relación 1 a N con `SaleItem`

2. **`Sale` (`sales`):**
   - `id`: UUID (Primary Key)
   - `receiptNumber`: Código único de ticket `VTA-YYYY-XXXX` (`@unique`)
   - `date`, `subtotal`, `discount`, `total`
   - `paymentMethod` (`EFECTIVO`, `MERCADOPAGO`, `TARJETA`, `TRANSFERENCIA`)
   - `cashReceived`, `cashChange`, `customerName`, `notes`
   - Relación 1 a N con `SaleItem`

3. **`SaleItem` (`sale_items`):**
   - `id`: UUID (Primary Key)
   - `saleId`: Foreign Key a `Sale` (onDelete: Cascade)
   - `productId`: Foreign Key a `Product` (onDelete: SetNull)
   - `name`, `sku`, `price`, `quantity`, `isCustom`, `subtotal`

4. **`WorkOrder` (`work_orders`):**
   - `id`: UUID (Primary Key)
   - `orderNumber`: Código único `OT-XXXX` (`@unique`)
   - `clientName`, `clientPhone`, `clientAddress`, `isHomeService`
   - `orderType`, `description`
   - `status` (`PENDIENTE`, `EN_PROCESO`, `TERMINADO`, `ENTREGADO`)
   - `estimatedCost`, `deposit`, `balance` (`estimatedCost - deposit`)
   - `promisedDate`, `completedAt`, `notes`

---

## 📡 Endpoints de la API REST (`http://localhost:3000/api`)

| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Salud** | `GET` | `/api/health` | Estado del backend y timestamp |
| **Inventario** | `GET` | `/api/products` | Lista de productos (filtros: `search`, `category`, `lowStock`) |
| **Inventario** | `GET` | `/api/products/:id` | Detalle de un producto |
| **Inventario** | `POST` | `/api/products` | Crear nuevo producto (valida SKU único) |
| **Inventario** | `PUT` | `/api/products/:id` | Editar producto existente |
| **Inventario** | `PATCH` | `/api/products/:id/stock` | Ajuste rápido de stock (`delta` o `newStock`) |
| **Inventario** | `DELETE`| `/api/products/:id` | Eliminar producto del catálogo |
| **Ventas (POS)** | `GET` | `/api/sales` | Historial de ventas con ítems incluidos |
| **Ventas (POS)** | `GET` | `/api/sales/:id` | Detalle de comprobante emitido |
| **Ventas (POS)** | `POST` | `/api/sales` | **Transacción atómica**: Valida y descuenta stock en Postgres |
| **Cerrajería** | `GET` | `/api/work-orders` | Lista de órdenes (filtro por `status` y `search`) |
| **Cerrajería** | `GET` | `/api/work-orders/:id`| Detalle de orden |
| **Cerrajería** | `POST` | `/api/work-orders` | Crear orden (auto-genera `OT-XXXX` y saldo) |
| **Cerrajería** | `PUT` | `/api/work-orders/:id`| Editar cliente, costo, seña y recalcula saldo |
| **Cerrajería** | `PATCH`| `/api/work-orders/:id/status` | Avance rápido de estado y timestamp de entrega |
| **Cerrajería** | `DELETE`| `/api/work-orders/:id`| Eliminar orden |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Métricas del día y arqueo por medio de pago |

---

## 🔌 Integración en el Frontend (`src/`)

- **Variable de Entorno:** `.env` en la raíz con `VITE_API_URL=http://localhost:3000/api`.
- **Cliente HTTP Centralizado:** [api.ts](file:///c:/Users/leonl/OneDrive%20-%20UTN%20FRLP/Escritorio/sistema%20ferreteria/src/services/api.ts) con el patrón `apiFetch` que centraliza encabezados, control de errores y deserialización.
- **Capa de Servicios:** [backendService.ts](file:///c:/Users/leonl/OneDrive%20-%20UTN%20FRLP/Escritorio/sistema%20ferreteria/src/services/backendService.ts) que expone funciones tipadas para cada entidad.
- **Contexto Global Reactivo:** [AppContext.tsx](file:///c:/Users/leonl/OneDrive%20-%20UTN%20FRLP/Escritorio/sistema%20ferreteria/src/context/AppContext.tsx) que al montar la app consulta la API de PostgreSQL; si el backend está activo, sincroniza la base real; y si el backend está apagado, activa un fallback offline para que nunca se interrumpa el flujo del usuario.
- **Indicador en Sidebar:** Muestra `🟢 Backend Conectado` cuando el servidor responde y cuenta con un botón para reintentar la conexión.

---

## 🚀 Guía de Comandos para Iniciar el Backend

1. **Asegurate de que Docker Desktop esté abierto** en tu sistema Windows.
2. Abrí una terminal en la carpeta `backend/` y ejecutá:

```powershell
# 1. Levantar el contenedor de PostgreSQL en segundo plano
docker compose up -d

# 2. Correr las migraciones iniciales de Prisma para crear las tablas
npx prisma migrate dev --name init

# 3. Cargar los datos iniciales de prueba (seed)
npm run prisma:seed

# 4. Iniciar el servidor backend en modo desarrollo con recarga automática
npm run dev
```

* El backend responderá en: **`http://localhost:3000`**
* Podés inspeccionar visualmente la base de datos en cualquier momento corriendo: `npx prisma studio`.
