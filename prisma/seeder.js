const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const employees = [
    { employeeId: '20220101', name: 'ANDI' },
    { employeeId: '20220102', name: 'JOHN' },
    { employeeId: '20220103', name: 'ELLE' },
    { employeeId: '20220104', name: 'GRACE' },
  ];

  const balances = [
    { employeeId: '20220101', balance: 1000000 },
    { employeeId: '20220102', balance: 4000000 },
    { employeeId: '20220104', balance: 300000 },
  ];

  for (let employee of employees) {
    await prisma.employee.create({
      data: employee,
    });
  }

  for (let balance of balances) {
    await prisma.balance.create({
      data: balance,
    });
  }

  console.log('Seeder executed successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });