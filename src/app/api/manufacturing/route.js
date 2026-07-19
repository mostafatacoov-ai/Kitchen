import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ManufacturingProject from '@/models/ManufacturingProject';
import FinancialRecord from '@/models/FinancialRecord';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  const auth = requireRole(request, ['AccountManager', 'Sales']); // Admin is always allowed implicitly
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const projectsDb = await ManufacturingProject.find()
      .populate('linkedProject', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    const projects = projectsDb.map(p => ({
      ...p,
      id: p._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Fetch manufacturing projects error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = requireRole(request, ['AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();

    if (!data.stagesData || data.stagesData.length === 0) {
      const defaultStages = [
        'Measurement', 'Design', 'Contract', 'Cutting', 'Assembling', 'Finishing', 'Delivery', 'Installation'
      ];
      data.stagesData = defaultStages.map(name => ({ name }));
    }

    const newProject = await ManufacturingProject.create(data);
    
    return NextResponse.json({ 
      success: true, 
      project: { ...newProject.toObject(), id: newProject._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create manufacturing project error:', error);
    return NextResponse.json({ success: false, error: 'Server error: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireRole(request, ['AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    const { id, newExpense, ...updateData } = data;

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const updatedProject = await ManufacturingProject.findByIdAndUpdate(id, updateData, { new: true })
      .populate('linkedProject', 'title')
      .lean();
    
    if (!updatedProject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (newExpense && newExpense.amount > 0) {
      await FinancialRecord.create({
        type: 'Expense',
        category: 'Material Cost',
        amount: newExpense.amount,
        date: new Date(),
        description: newExpense.description || `Cost for Manufacturing Project: ${updatedProject.kitchenName}`,
        relatedProject: id
      });
    }

    return NextResponse.json({ 
      success: true, 
      project: { ...updatedProject, id: updatedProject._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Update manufacturing project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = requireRole(request, []); // Admin only
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await ManufacturingProject.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete manufacturing project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
