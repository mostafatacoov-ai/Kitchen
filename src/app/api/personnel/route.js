import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Employee from '@/models/Employee';
import { requireRole } from '@/lib/auth';

export async function POST(request) {
  const auth = requireRole(request, []); // Only Admin
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    const newEmployee = await Employee.create(data);
    
    return NextResponse.json({ 
      success: true, 
      employee: { ...newEmployee.toObject(), id: newEmployee._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const auth = requireRole(request, []); // Only Admin can view HR
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const employeesDb = await Employee.find().sort({ createdAt: -1 }).lean();
    
    const employees = employeesDb.map(e => ({
      ...e,
      id: e._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error('Fetch employees error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireRole(request, []); // Only Admin
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id, ...updateData } = await request.json();

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedEmployee) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      employee: { ...updatedEmployee.toObject(), id: updatedEmployee._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = requireRole(request, []); // Only Admin
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await Employee.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
