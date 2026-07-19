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

export async function GET(request) {
  try {
    await dbConnect();
    const projectsDb = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    
    // Map _id to id for frontend compatibility
    const projects = projectsDb.map(proj => ({
      ...proj,
      id: proj._id.toString(),
      _id: undefined
    }));

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
    await dbConnect();
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

    const newProject = await ProjectModel.create({
      title: {
        en: titleEn,
        ar: titleAr
      },
      desc: {
        en: descEn || '',
        ar: descAr || ''
      },
      category: category,
      images: imageUrls,
    });

    const projectObject = {
      id: newProject._id.toString(),
      title: newProject.title,
      description: newProject.desc, // Frontend might expect description instead of desc based on old logic, but let's stick to what we had
      category: newProject.category,
      images: newProject.images,
      createdAt: newProject.createdAt.toISOString()
    };

    return NextResponse.json({ success: true, project: projectObject });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
