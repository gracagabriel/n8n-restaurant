// Script para atualizar emails dos usuários

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Atualizando emails dos usuários...');

  // Deletar usuários antigos
  await prisma.user.deleteMany();
  console.log('✓ Usuários antigos removidos');

  // Criar novos usuários com emails corretos
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@restaurant.com',
        name: 'Administrador',
        password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
        role: 'ADMIN',
        phone: '11999999999',
      },
      {
        email: 'gerente@restaurant.com',
        name: 'Gerente',
        password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
        role: 'MANAGER',
        phone: '11988888888',
      },
      {
        email: 'garcom@restaurant.com',
        name: 'Garçom',
        password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
        role: 'WAITER',
        phone: '11987654321',
      },
      {
        email: 'cozinha@restaurant.com',
        name: 'Cozinha',
        password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
        role: 'KITCHEN',
      },
      {
        email: 'bar@restaurant.com',
        name: 'Bar',
        password: '$2b$10$0o5yfH1S..p6GhQb0u9wOe7v2U4qVHjN2RqO3.R5Jmz.dW4mxJTSK',
        role: 'BAR',
      },
    ],
  });

  console.log('✓ Novos usuários criados com emails corretos');
  console.log('\n✅ Atualização concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
