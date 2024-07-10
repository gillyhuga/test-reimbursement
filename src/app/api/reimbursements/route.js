import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();


export async function POST(req) {
  try {
    const body = await req.json();
    const { employeeId, date, items } = body;

    const totalReimbursementAmount = items.reduce((total, item) => total + item.amount, 0);

    const balance = await prisma.balance.findFirst({
      where: { employeeId }
    });

    if (!balance) {
      return NextResponse.json({ message: 'Balance record not found' }, { status: 400 });
    }

    if (balance.balance === 0 || balance.balance < totalReimbursementAmount) {
      return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
    }

    const reimbursement = await prisma.reimbursement.create({
      data: {
        employeeId,
        date: new Date(date),
        items: {
          create: items.map(item => ({
            description: item.description,
            amount: item.amount,
            date: new Date(item.date)
          }))
        }
      },
    });

    await prisma.balance.update({
      where: { id: balance.id }, 
      data: {
        balance: {
          decrement: totalReimbursementAmount
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Reimbursement created successfully and balance updated',
        reimbursement
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating reimbursement:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}