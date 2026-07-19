import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RequestModel from '@/models/Request';

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
    const requestsDb = await RequestModel.find().sort({ createdAt: -1 }).lean();
    
    // Map _id to id for frontend compatibility
    const requests = requestsDb.map(req => ({
      ...req,
      id: req._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
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

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const deleted = await RequestModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
