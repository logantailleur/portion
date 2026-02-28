import 'dotenv/config';
import { prisma } from '../lib/db';

async function main() {
  await prisma.food.create({
    data: {
      name: 'Chicken Breast',
      caloriesPerGram: 165,
      proteinPerGram: 31,
      carbsPerGram: 0,
      fatPerGram: 3,
      source: 'manual',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
