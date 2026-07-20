import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PurchaseOrder from '@/models/PurchaseOrder';
import FinancialRecord from '@/models/FinancialRecord';
import ManufacturingProject from '@/models/ManufacturingProject';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const auth = requireRole(request, ['Purchasing', 'AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, orders: orders.map(o => ({ ...o, id: o._id.toString(), _id: undefined })) });
  } catch (error) {
    console.error('Fetch PO error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireRole(request, ['Purchasing', 'AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    const newPO = await PurchaseOrder.create(data);
    return NextResponse.json({ success: true, order: { ...newPO.toObject(), id: newPO._id.toString(), _id: undefined } });
  } catch (error) {
    console.error('Create PO error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireRole(request, ['Purchasing', 'AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    const { id, newExpense, ...updateData } = data;

    const po = await PurchaseOrder.findByIdAndUpdate(id, updateData, { new: true });
    
    if (newExpense && newExpense.amount > 0) {
      await FinancialRecord.create({
        type: 'Expense',
        category: 'Material Cost',
        amount: newExpense.amount,
        date: new Date(),
        description: `Material Purchase for PO: ${po.kitchenName}`,
        relatedProject: po.jobOrderId
      });

      // Update total cost in Manufacturing Project
      await ManufacturingProject.findByIdAndUpdate(po.jobOrderId, {
        $inc: { totalCost: newExpense.amount }
      });
    }

    return NextResponse.json({ success: true, order: po });
  } catch (error) {
    console.error('Update PO error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
