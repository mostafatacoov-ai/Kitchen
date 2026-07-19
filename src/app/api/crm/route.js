import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CRMLead from '@/models/CRMLead';

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
    const leadsDb = await CRMLead.find().sort({ createdAt: -1 }).lean();
    
    const leads = leadsDb.map(lead => ({
      ...lead,
      id: lead._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Fetch leads error:', error);
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
    const newLead = await CRMLead.create(data);
    
    return NextResponse.json({ 
      success: true, 
      lead: { ...newLead.toObject(), id: newLead._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create lead error:', error);
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

    const updatedLead = await CRMLead.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedLead) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ 
      success: true, 
      lead: { ...updatedLead.toObject(), id: updatedLead._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Update lead error:', error);
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

    await CRMLead.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
