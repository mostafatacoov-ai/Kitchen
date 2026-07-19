import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FinancialRecord from '@/models/FinancialRecord';
import { requireRole } from '@/lib/auth';

export async function POST(request) {
  const auth = requireRole(request, ['Accounting']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    const newRecord = await FinancialRecord.create(data);
    
    return NextResponse.json({ 
      success: true, 
      record: { ...newRecord.toObject(), id: newRecord._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create financial record error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const auth = requireRole(request, ['Accounting']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const recordsDb = await FinancialRecord.find().sort({ date: -1 }).lean();
    
    const records = recordsDb.map(r => ({
      ...r,
      id: r._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Fetch financial records error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = requireRole(request, []); // Only Admin can delete financial records
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await FinancialRecord.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete financial record error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
