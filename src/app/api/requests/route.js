import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const filePath = path.join(process.cwd(), 'src/data/requests.json');
    let requests = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      requests = JSON.parse(fileData || '[]');
    }

    // Sort by createdAt descending
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/requests.json');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'Database file not found' }, { status: 404 });
    }

    const fileData = fs.readFileSync(filePath, 'utf8');
    let requests = JSON.parse(fileData || '[]');
    
    const initialLength = requests.length;
    requests = requests.filter(r => r.id !== id);

    if (requests.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
