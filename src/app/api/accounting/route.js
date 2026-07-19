import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FinancialRecord from '@/models/FinancialRecord';

function verifyPasskey(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  return passkey === expectedPasskey;
}

export async function GET(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const recordsDb = await FinancialRecord.find().populate('relatedProject').sort({ date: -1 }).lean();
    
    const records = recordsDb.map(rec => ({
      ...rec,
      id: rec._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Fetch financial records error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const newRecord = await FinancialRecord.create(data);
    
    const populated = await FinancialRecord.findById(newRecord._id).populate('relatedProject').lean();

    return NextResponse.json({ 
      success: true, 
      record: { ...populated, id: populated._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create financial record error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const updatedRecord = await FinancialRecord.findByIdAndUpdate(id, updateData, { new: true }).populate('relatedProject').lean();
    
    if (!updatedRecord) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      record: { ...updatedRecord, id: updatedRecord._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Update financial record error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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
