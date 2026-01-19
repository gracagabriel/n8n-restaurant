"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    // Limpar dados existentes (cuidado em produção!)
    if (process.env.NODE_ENV === 'development') {
        await prisma.auditLog.deleteMany();
        await prisma.webhookEvent.deleteMany();
        await prisma.payment.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.table.deleteMany();
        await prisma.menuItem.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
        console.log('✓ Dados anteriores removidos');
    }
    // 1. Criar usuários
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@restaurant.com',
            name: 'Administrador',
            password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK', // admin123 (bcrypt)
            role: 'ADMIN',
            phone: '11999999999',
        },
    });
    const managerUser = await prisma.user.create({
        data: {
            email: 'gerente@restaurant.com',
            name: 'Gerente',
            password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
            role: 'MANAGER',
            phone: '11988888888',
        },
    });
    const waiterUser = await prisma.user.create({
        data: {
            email: 'garcom@restaurant.com',
            name: 'Garçom',
            password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
            role: 'WAITER',
            phone: '11987654321',
        },
    });
    const kitchenUser = await prisma.user.create({
        data: {
            email: 'cozinha@restaurant.com',
            name: 'Cozinha',
            password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
            role: 'KITCHEN',
        },
    });
    const barUser = await prisma.user.create({
        data: {
            email: 'bar@restaurant.com',
            name: 'Bar',
            password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
            role: 'BAR',
        },
    });
    console.log('✓ Usuários criados');
    // 2. Criar categorias
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Bebidas Quentes',
                description: 'Café, chá e bebidas quentes',
                displayOrder: 1,
            },
        }),
        prisma.category.create({
            data: {
                name: 'Bebidas Frias',
                description: 'Refrigerantes, sucos e bebidas geladas',
                displayOrder: 2,
            },
        }),
        prisma.category.create({
            data: {
                name: 'Entradas',
                description: 'Aperitivos e entradas',
                displayOrder: 3,
            },
        }),
        prisma.category.create({
            data: {
                name: 'Pratos Principais',
                description: 'Principais da nossa casa',
                displayOrder: 4,
            },
        }),
        prisma.category.create({
            data: {
                name: 'Sobremesas',
                description: 'Doces e sobremesas',
                displayOrder: 5,
            },
        }),
    ]);
    console.log('✓ Categorias criadas');
    // 3. Criar itens do menu
    const menuItems = await Promise.all([
        // Bebidas Quentes
        prisma.menuItem.create({
            data: {
                name: 'Café Expresso',
                description: 'Café expresso puro',
                price: 800, // R$ 8.00
                categoryId: categories[0].id,
                preparationTimeMinutes: 2,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Café com Leite',
                description: 'Café expresso com leite quente',
                price: 1000,
                categoryId: categories[0].id,
                preparationTimeMinutes: 3,
            },
        }),
        // Bebidas Frias
        prisma.menuItem.create({
            data: {
                name: 'Refrigerante 2L',
                description: 'Refrigerante variados',
                price: 1500,
                categoryId: categories[1].id,
                preparationTimeMinutes: 1,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Suco Natural',
                description: 'Suco de laranja, morango ou melancia',
                price: 1200,
                categoryId: categories[1].id,
                preparationTimeMinutes: 5,
            },
        }),
        // Entradas
        prisma.menuItem.create({
            data: {
                name: 'Bolinhas de Queijo',
                description: 'Bolinhas de queijo crocantes',
                price: 2500,
                categoryId: categories[2].id,
                preparationTimeMinutes: 8,
                isVegetarian: true,
                calories: 250,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Asas de Frango',
                description: 'Asas de frango temperadas e assadas',
                price: 3500,
                categoryId: categories[2].id,
                preparationTimeMinutes: 12,
                calories: 350,
            },
        }),
        // Pratos Principais
        prisma.menuItem.create({
            data: {
                name: 'Filé à Parmegiana',
                description: 'Filé mignon coberto com queijo derretido',
                price: 7500,
                categoryId: categories[3].id,
                preparationTimeMinutes: 20,
                calories: 650,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Risoto de Cogumelo',
                description: 'Risoto cremoso com cogumelos frescos',
                price: 4500,
                categoryId: categories[3].id,
                preparationTimeMinutes: 18,
                isVegetarian: true,
                calories: 520,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Salmão Grelhado',
                description: 'Salmão fresco grelhado na manteiga',
                price: 6500,
                categoryId: categories[3].id,
                preparationTimeMinutes: 15,
                calories: 480,
            },
        }),
        // Sobremesas
        prisma.menuItem.create({
            data: {
                name: 'Chocolate Quente',
                description: 'Chocolate quente cremoso',
                price: 1800,
                categoryId: categories[4].id,
                preparationTimeMinutes: 4,
                isVegetarian: true,
                calories: 280,
            },
        }),
        prisma.menuItem.create({
            data: {
                name: 'Sorvete',
                description: 'Sorvete variados - menta, morango, chocolate',
                price: 1500,
                categoryId: categories[4].id,
                preparationTimeMinutes: 2,
                isVegetarian: true,
                calories: 200,
            },
        }),
    ]);
    console.log('✓ Itens do menu criados');
    // 4. Criar mesas
    const tables = await Promise.all([
        prisma.table.create({
            data: {
                number: '1',
                area: 'Salão',
                capacity: 4,
            },
        }),
        prisma.table.create({
            data: {
                number: '2',
                area: 'Salão',
                capacity: 4,
            },
        }),
        prisma.table.create({
            data: {
                number: '3',
                area: 'Varanda',
                capacity: 6,
            },
        }),
        prisma.table.create({
            data: {
                number: '4',
                area: 'Privativo',
                capacity: 8,
            },
        }),
        prisma.table.create({
            data: {
                number: '5',
                area: 'Bar',
                capacity: 2,
            },
        }),
    ]);
    console.log('✓ Mesas criadas');
    // 5. Criar pedido de exemplo
    const order = await prisma.order.create({
        data: {
            orderNumber: 'PED-001',
            tableId: tables[0].id,
            userId: waiterUser.id,
            status: 'PENDING',
            notes: 'Cliente é vegetariano',
            items: {
                create: [
                    {
                        menuItemId: menuItems[1].id, // Café com Leite
                        quantity: 2,
                        unitPrice: menuItems[1].price,
                        notes: 'Sem açúcar',
                    },
                    {
                        menuItemId: menuItems[7].id, // Risoto de Cogumelo
                        quantity: 1,
                        unitPrice: menuItems[7].price,
                    },
                ],
            },
        },
        include: {
            items: true,
        },
    });
    console.log('✓ Pedido de exemplo criado');
    // 6. Criar configurações do sistema
    await prisma.systemConfig.create({
        data: {
            key: 'restaurant_name',
            value: 'Restaurante do Hotel',
            description: 'Nome do restaurante',
        },
    });
    await prisma.systemConfig.create({
        data: {
            key: 'service_charge_percentage',
            value: '10',
            type: 'number',
            description: 'Percentual de taxa de serviço',
        },
    });
    console.log('✓ Configurações do sistema criadas');
    console.log('✅ Seed concluído com sucesso!');
}
main()
    .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
