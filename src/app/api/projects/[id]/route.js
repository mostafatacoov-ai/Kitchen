import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import ProjectModel from '@/models/Project';

function verifyPasskey(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  return passkey === expectedPasskey;
}

export async function DELETE(request, context) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Next.js >= 15 requires params to be awaited
    const params = await context.params;
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await dbConnect();
    const deleted = await ProjectModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Also delete the uploaded files
    const uploadDir = path.join(process.cwd(), 'public/uploads/projects', id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
