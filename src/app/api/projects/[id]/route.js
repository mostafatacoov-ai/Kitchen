import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function verifyPasskey(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  return passkey === expectedPasskey;
}

function getFilePath() {
  return path.join(process.cwd(), 'src/data/projects.json');
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

    const filePath = getFilePath();
    let projects = [];
    if (fs.existsSync(filePath)) {
      projects = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
    }

    const initialLength = projects.length;
    projects = projects.filter(p => p.id !== id);

    if (projects.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf8');

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
