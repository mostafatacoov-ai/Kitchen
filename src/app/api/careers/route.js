import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import JobApplication from '@/models/JobApplication';

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const application = await JobApplication.create(data);
    
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Job application submission error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  
  if (passkey !== expectedPasskey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const applicationsDb = await JobApplication.find().sort({ createdAt: -1 }).lean();
    
    const applications = applicationsDb.map(app => ({
      ...app,
      id: app._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('Fetch job applications error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  
  if (passkey !== expectedPasskey) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id, status } = await request.json();

    if (!id || !status) return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });

    const updated = await JobApplication.findByIdAndUpdate(id, { status }, { new: true }).lean();
    
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, application: { ...updated, id: updated._id.toString(), _id: undefined } });
  } catch (error) {
    console.error('Update job application error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
