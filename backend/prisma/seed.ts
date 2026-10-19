import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos de prueba (seed) para Tolosano...');

  // Limpiar datos existentes respetando foreign keys
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.product.deleteMany();

  // 1. Cargar Productos de Ferretería & Cerrajería
  console.log('📦 Insertando productos...');
  const productsData = [
    {
      sku: 'CER-KAL-4000',
      name: 'Cerradura Kallay 4000 Seguridad Pasador Redondo',
      category: 'Cerraduras y Cerrojos',
      costPrice: 18500,
      salePrice: 28900,
      stock: 4,
      minStock: 5,
      description: 'Cerradura embutir 4 placas de acero laminado para puertas de exterior.',
    },
    {
      sku: 'CER-PRI-200',
      name: 'Cerrojo Prive 200 Pasador Rectangular Cruz',
      category: 'Cerraduras y Cerrojos',
      costPrice: 12400,
      salePrice: 19800,
      stock: 8,
      minStock: 4,
      description: 'Cerrojo de seguridad con llave cruz para puerta de entrada.',
    },
    {
      sku: 'CAN-TRAB-50',
      name: 'Candado Trabex 50mm Bronce Macizo Reforzado',
      category: 'Seguridad y Candados',
      costPrice: 8200,
      salePrice: 13500,
      stock: 2,
      minStock: 6,
      description: 'Candado de máxima resistencia anti-cizalla con 3 llaves.',
    },
    {
      sku: 'LLA-YAL-Y1',
      name: 'Llave en Blanco Tipo Yale Y1 (x100 u)',
      category: 'Llaves en Blanco y Copias',
      costPrice: 15000,
      salePrice: 26000,
      stock: 12,
      minStock: 5,
      description: 'Llave virgen de latón para duplicación en máquina copiadora.',
    },
    {
      sku: 'LLA-MUL-T6',
      name: 'Llave Multipunto Computada Virgen Modelo T6',
      category: 'Llaves en Blanco y Copias',
      costPrice: 1900,
      salePrice: 4200,
      stock: 3,
      minStock: 10,
      description: 'Llave de seguridad multipunto con mapa computado.',
    },
    {
      sku: 'HER-TAL-BOS',
      name: 'Taladro Percutor Bosch GSB 13 RE 650W',
      category: 'Herramientas Eléctricas',
      costPrice: 65000,
      salePrice: 98000,
      stock: 3,
      minStock: 2,
      description: 'Taladro profesional con mandril 13mm y velocidad variable reversible.',
    },
    {
      sku: 'HER-CIN-STA',
      name: 'Cinta Métrica Stanley Powerlock 5 Metros',
      category: 'Herramientas Manuales',
      costPrice: 6200,
      salePrice: 9900,
      stock: 14,
      minStock: 6,
      description: 'Cinta métrica metálica con traba y hoja revestida en Mylar.',
    },
    {
      sku: 'TOR-AUT-T1',
      name: 'Tornillo Autoperforante T1 Aguja 8x1/2 (Caja x 1000u)',
      category: 'Tornillería y Fijaciones',
      costPrice: 11200,
      salePrice: 18000,
      stock: 6,
      minStock: 3,
      description: 'Para perfilería durlock y chapas delgadas cabeza plana.',
    },
    {
      sku: 'LUB-WD40-300',
      name: 'Aerosol Lubricante Multiuso WD-40 300ml con Pico',
      category: 'Varios y Accesorios',
      costPrice: 6800,
      salePrice: 11200,
      stock: 12,
      minStock: 6,
      description: 'Desplaza humedad, afloja piezas trabadas y protege contra el óxido.',
    },
    {
      sku: 'DIS-TYR-115',
      name: 'Disco de Corte Tyrolit Secur Extra 115 x 1.0mm',
      category: 'Herramientas Eléctricas',
      costPrice: 950,
      salePrice: 1850,
      stock: 48,
      minStock: 25,
      description: 'Disco abrasivo ultra fino para acero inoxidable y metales ferrosos.',
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const p = await prisma.product.create({ data: prod });
    createdProducts.push(p);
  }

  // 2. Cargar Órdenes de Trabajo de Cerrajería
  console.log('🔧 Insertando órdenes de cerrajería...');
  await prisma.workOrder.createMany({
    data: [
      {
        orderNumber: 'OT-0084',
        clientName: 'Roberto Gómez',
        clientPhone: '221-554-9821',
        clientAddress: 'Calle 528 e/ 11 y 12 N° 845, Tolosa',
        isHomeService: true,
        orderType: 'Apertura a Domicilio',
        description: 'Puerta blindada trabada por llave partida en tambor superior Kallay. Urgencia.',
        status: 'PENDIENTE',
        estimatedCost: 35000,
        deposit: 10000,
        balance: 25000,
        notes: 'Llamar 15 min antes de salir.',
      },
      {
        orderNumber: 'OT-0085',
        clientName: 'María Eugenia Rossi',
        clientPhone: '221-489-1120',
        clientAddress: '',
        isHomeService: false,
        orderType: 'Cambio de Combinación',
        description: 'Cerradura Acitra 4 placas de portón. Realizar cambio de combinación y entregar 4 copias.',
        status: 'EN_PROCESO',
        estimatedCost: 22000,
        deposit: 12000,
        balance: 10000,
        notes: 'Placas desarmadas en banco 2.',
      },
      {
        orderNumber: 'OT-0086',
        clientName: 'Carlos Mendonça',
        clientPhone: '221-303-7711',
        clientAddress: '',
        isHomeService: false,
        orderType: 'Codificación Llave Automotor',
        description: 'Copia y tallado con chip transponder ID48 para Volkswagen Gol Trend 2017.',
        status: 'PENDIENTE',
        estimatedCost: 48000,
        deposit: 20000,
        balance: 28000,
        notes: 'Dejó auto en la cuadra.',
      },
    ],
  });

  // 3. Cargar Venta inicial
  console.log('🧾 Insertando venta de prueba...');
  const wd40 = createdProducts.find((p) => p.sku === 'LUB-WD40-300');
  await prisma.sale.create({
    data: {
      receiptNumber: 'VTA-2026-0001',
      subtotal: 18200,
      discount: 0,
      total: 18200,
      paymentMethod: 'EFECTIVO',
      cashReceived: 20000,
      cashChange: 1800,
      customerName: 'Cliente Mostrador',
      notes: 'Venta inicial de apertura',
      items: {
        create: [
          {
            name: 'Aerosol Lubricante Multiuso WD-40 300ml con Pico',
            sku: wd40?.sku || 'LUB-WD40-300',
            productId: wd40?.id,
            price: 11200,
            quantity: 1,
            isCustom: false,
            subtotal: 11200,
          },
          {
            name: 'Copia Llave Cruz (Mano de obra)',
            price: 3500,
            quantity: 2,
            isCustom: true,
            subtotal: 7000,
          },
        ],
      },
    },
  });

  console.log('✅ Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
