import { NextResponse } from 'next/server';

function verifyPasskey(request) {
  const passkey = request.headers.get('x-admin-passkey');
  const expectedPasskey = process.env.ADMIN_PASSKEY || '123456';
  return passkey === expectedPasskey;
}

async function getFilePath() {
  const path = await import('path');
  return path.join(process.cwd(), 'src/data/requests.json');
}

async function readRequests() {
  try {
    const fs = await import('fs');
    const filePath = await getFilePath();
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(fileData || '[]');
      } catch {
        return [];
      }
    }
    return [];
  } catch {
    // File system not available (read-only hosting like Hostinger)
    return [];
  }
}

async function writeRequests(requests) {
  try {
    const fs = await import('fs');
    const filePath = await getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const requests = await readRequests();
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

    let requests = await readRequests();
    const initialLength = requests.length;
    requests = requests.filter(r => r.id !== id);

    if (requests.length === initialLength) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    await writeRequests(requests);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
