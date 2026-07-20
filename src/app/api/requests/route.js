import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RequestModel from '@/models/Request';
import { requireRole } from '@/lib/auth';

export async function GET(request) {
  console.log("HIT GET /api/requests");
  const auth = requireRole(request, ['Sales']); // Admin and Sales can view requests
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const requestsDb = await RequestModel.find().sort({ createdAt: -1 }).lean();
    
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
  const auth = requireRole(request, []); // Only Admin can delete
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await RequestModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
