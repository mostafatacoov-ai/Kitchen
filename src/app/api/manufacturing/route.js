import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ManufacturingProject from '@/models/ManufacturingProject';

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
    // Populate the assignedPersonnel to get employee details
    const projectsDb = await ManufacturingProject.find().populate('assignedPersonnel').sort({ createdAt: -1 }).lean();
    
    const projects = projectsDb.map(proj => ({
      ...proj,
      id: proj._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Fetch manufacturing projects error:', error);
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
    const newProject = await ManufacturingProject.create(data);
    
    // We fetch it again to populate the assignedPersonnel just in case
    const populated = await ManufacturingProject.findById(newProject._id).populate('assignedPersonnel').lean();

    return NextResponse.json({ 
      success: true, 
      project: { ...populated, id: populated._id.toString(), _id: undefined } 
    });
  } catch (error) {
    console.error('Create manufacturing project error:', error);
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

    const updatedProject = await ManufacturingProject.findByIdAndUpdate(id, updateData, { new: true }).populate('assignedPersonnel').lean();
    
    if (!updatedProject) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

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
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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
