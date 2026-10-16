# Tolosano - Ferretería & Cerrajería (Etapa 1: Frontend)

Sistema integral de gestión de mostrador, inventario, punto de venta (POS) y taller de cerrajería construido con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS**.

---

## 🎨 Identidad Visual y Estilos

- **Identidad de Marca:** "Tolosano - Ferretería & Cerrajería"
- **Paleta de Colores:** 
  - Primarios: Tonos Navy y Slate oscuro (`#0f172a`, `#1e293b`, `#1e3a8a`, `slate-900`) que otorgan aspecto sobrio y profesional de dashboard administrativo.
  - Acentos: Ámbar / Naranja (`#f59e0b`, `amber-500`) para alertar sobre stock crítico, señas pendientes y servicios en espera.
  - Éxito / Cobros: Esmeralda (`#10b981`, `emerald-600`) para transacciones confirmadas, pedidos terminados y stock óptimo.
- **Tipografía:** Fuente **Inter** cargada desde Google Fonts para máxima legibilidad de números, códigos y tablas.

---

## 🏗️ Arquitectura del Proyecto (Preparada para Etapa 2 con API REST)

```
sistema ferreteria/
├── public/
├── src/
│   ├── types/
│   │   └── index.ts                 # Modelos TypeScript (Product, CartItem, Sale, WorkOrder, etc.)
│   ├── services/
│   │   ├── mockData.ts              # Semilla de datos realistas (Kallay, Trabex, Yale, Bosch, etc.)
│   │   └── storageService.ts        # Capa de persistencia en localStorage (aislada para swappear con Axios/Fetch en Etapa 2)
│   ├── context/
│   │   └── AppContext.tsx           # Context API global con sincronización en tiempo real y notificaciones Toast
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx            # Badges de stock, estados de órdenes y medios de pago
│   │   │   ├── Modal.tsx            # Modal reutilizable con accesibilidad (Escape, Backdrop Blur)
│   │   │   ├── StatCard.tsx         # Tarjetas de métricas del panel principal
│   │   │   └── ToastContainer.tsx   # Sistema de notificaciones flotantes
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Barra lateral con contadores vivos (Stock bajo, Carrito, Cerrajería pendiente)
│   │   │   ├── Header.tsx           # Barra superior con fecha, migas de pan y accesos directos
│   │   │   └── Layout.tsx           # Shell del dashboard con responsive navigation
│   │   ├── inventory/
│   │   │   └── ProductModal.tsx     # Creación/edición de productos con cálculo de margen en tiempo real
│   │   ├── pos/
│   │   │   ├── CustomItemModal.tsx  # Mano de obra al vuelo con presets (Copias Yale, Doble Paleta, Computada, etc.)
│   │   │   └── ReceiptModal.tsx     # Comprobante / Ticket térmico imprimible
│   │   └── locksmith/
│   │       └── WorkOrderModal.tsx   # Registro de órdenes con cálculo automático de seña y saldo
│   ├── pages/
│   │   ├── DashboardPage.tsx        # Panel de control con métricas del día y alertas
│   │   ├── InventoryPage.tsx        # Catálogo, buscador por SKU/nombre, filtro de stock bajo y ajuste +/-
│   │   ├── PosPage.tsx              # Mostrador ágil de cobro, carrito, cálculo de vuelto y descuento de stock
│   │   ├── LocksmithPage.tsx        # Taller de cerrajería, aperturas a domicilio, estados y WhatsApp directo
│   │   └── SalesHistoryPage.tsx     # Historial de ventas con arqueo de caja y exportación a CSV
│   ├── App.tsx                      # Enrutador con React Router DOM
│   ├── main.tsx                     # Punto de entrada
│   └── index.css                    # Directivas de Tailwind y estilos base
├── tailwind.config.js               # Configuración de colores corporativos
├── package.json
└── vite.config.ts
```

---

## ⚡ Módulos y Funcionalidades Implementadas

### 1. Inventario y Control de Stock
- **Buscador en tiempo real:** Búsqueda instantánea por nombre de producto, código/SKU o categoría.
- **Alertas visuales de stock:**
  - Badge rojo pulsante para productos con **0 unidades** (Sin Stock).
  - Badge amarillo/ámbar para productos con **stock menor o igual al stock mínimo** (Stock Bajo).
- **Filtro rápido:** Toggle "Solo stock bajo" para visualizar inmediatamente los artículos a pedir a proveedores.
- **Ajuste rápido de mostrador:** Botones `+` y `-` directamente en la fila de la tabla para ajustes rápidos de stock.
- **Formulario / Modal completo:** Alta y edición de productos con cálculo automático de ganancia y rentabilidad (%).

### 2. Punto de Venta / Caja de Mostrador (POS)
- **Diseño a dos columnas optimizado para velocidad:**
  - **Catálogo:** Búsqueda rápida, chips de categorías y tarjetas seleccionables de productos con stock visible.
  - **Carrito activo:** Control de cantidades (+ / -), control de límite contra stock disponible y vaciado rápido.
- **Mano de Obra / Ítem Libre al vuelo:** Botón directo con accesos rápidos para servicios típicos de cerrajería (*Copia Yale común*, *Copia Doble Paleta*, *Copia Multipunto Computada*, *Mano de obra mostrador*, *Cambio de combinación*).
- **Medios de Pago:** Selección visual entre *Efectivo*, *Mercado Pago / QR* y *Tarjeta Débito/Crédito*.
- **Calculadora de Vuelto:** Ingreso del importe entregado por el cliente y cálculo automático del cambio.
- **Descuento de Stock Automático:** Al confirmar la venta, se descuentan las unidades vendidas de los productos correspondientes en el inventario.
- **Ticket / Comprobante Térmico:** Modal inmediato con comprobante listo para imprimir o revisar (`window.print()`).

### 3. Órdenes de Trabajo / Servicios de Cerrajería
- **Especializado para cerrajería integral:**
  - Aperturas de urgencia a domicilio.
  - Cambios de combinación de cerraduras.
  - Reparación de tambores y cilindros.
  - Codificación y tallado de llaves automotor con chip.
  - Copias especiales y de seguridad.
- **Campos del trabajo:** Cliente (nombre y teléfono), tipo de servicio, descripción de la falla, switch de servicio a domicilio (con dirección exacta), fecha/hora prometida y notas internas.
- **Finanzas del servicio:** Cálculo en vivo de `Saldo = Costo Estimado - Seña Dejada`.
- **Flujo de estados en 1 clic:** Botones para transicionar rápidamente entre *Pendiente* &rarr; *En Proceso* &rarr; *Terminado* &rarr; *Entregado/Cobrado*.
- **Integración con WhatsApp:** Botón que abre chat directo con el cliente con mensaje pre-redactado para avisarle que su trabajo está terminado y el saldo a abonar.

### 4. Historial de Ventas y Resumen Diario (Dashboard)
- **Panel de Inicio (Dashboard):**
  - Métricas del día: Total vendido hoy, cantidad de operaciones, alertas de stock crítico y trabajos de cerrajería activos.
  - Desglose de ingresos de hoy según medio de pago (Efectivo, Mercado Pago, Tarjeta).
  - Tablas de accesos directos: Últimas ventas del día, órdenes de cerrajería en curso y artículos críticos para reposición.
- **Historial Completo de Ventas:**
  - Filtro por período (Hoy, Últimos 7 días, Últimos 30 días, Histórico completo).
  - Filtro por medio de pago y buscador por número de comprobante o cliente.
  - Botón de re-impresión o visualización de cualquier ticket histórico.
  - **Exportar a CSV:** Descarga directa de archivo Excel / CSV para control de caja.

### 5. Botón de Restauración Demo
- En el pie de la barra lateral se incluye un botón para restablecer todos los datos a la semilla original en caso de que desees reiniciar las pruebas.

---

## 🚀 Servidor de Desarrollo Activo

El servidor local de desarrollo se encuentra actualmente en ejecución en:
👉 **`http://127.0.0.1:5173/`**
