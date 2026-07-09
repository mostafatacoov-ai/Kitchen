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

function readProjects() {
  try {
    const filePath = getFilePath();
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
    return [];
  }
}

function writeProjects(projects) {
  try {
    const filePath = getFilePath();
    fs.writeFileSync(filePath, JSON.stringify(projects, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  try {
    const projects = readProjects();
    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!verifyPasskey(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const titleEn = formData.get('titleEn');
    const titleAr = formData.get('titleAr');
    const descEn = formData.get('descEn');
    const descAr = formData.get('descAr');
    const category = formData.get('category');
    
    // Extract multiple files (images)
    const files = formData.getAll('images');
    
    if (!titleEn || !titleAr || !category || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing required fields or images' }, { status: 400 });
    }

    const projectId = Date.now().toString();
    const uploadDir = path.join(process.cwd(), 'public/uploads/projects', projectId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imageUrls = [];

    // Save files
    for (const file of files) {
      if (file && typeof file.arrayBuffer === 'function') {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate a safe file name (using original name but sanitized)
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const fileName = `${Date.now()}-${safeName}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        imageUrls.push(`/uploads/projects/${projectId}/${fileName}`);
      }
    }

    const newProject = {
      id: projectId,
      title: {
        en: titleEn,
        ar: titleAr
      },
      description: {
        en: descEn || '',
        ar: descAr || ''
      },
      category: category,
      images: imageUrls,
      createdAt: new Date().toISOString()
    };

    const projects = readProjects();
    projects.push(newProject);
    writeProjects(projects);

    return NextResponse.json({ success: true, project: newProject });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
