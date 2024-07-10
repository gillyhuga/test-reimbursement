import { PrismaClient } from '@prisma/client';
import {NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        balances: true,
        reimbursements: {
          include: {
            items: true,
          },
        },
      },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
