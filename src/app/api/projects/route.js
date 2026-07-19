import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ProjectModel from '@/models/Project';
import { requireRole } from '@/lib/auth';

export async function POST(request) {
  const auth = requireRole(request, ['AccountManager']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const formData = await request.formData();
    const titleEn = formData.get('titleEn');
    const titleAr = formData.get('titleAr');
    const descEn = formData.get('descEn');
    const descAr = formData.get('descAr');
    const category = formData.get('category');
    
    const files = formData.getAll('images');
    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Images are required' }, { status: 400 });
    }

    // In a real app, upload files to S3/Cloudinary and get URLs
    // For this prototype, we'll store dummy paths
    const imageUrls = files.map((file, i) => `/images/projects/project-${Date.now()}-${i}.jpg`);

    const newProject = await ProjectModel.create({
      title: { en: titleEn, ar: titleAr },
      description: { en: descEn, ar: descAr },
      category: category,
      images: imageUrls,
    });

    return NextResponse.json({ 
      success: true, 
      project: { ...newProject.toObject(), id: newProject._id.toString(), _id: undefined } 
    });

  } catch (error) {
    console.error('Project upload error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  // Public route, no auth required to GET projects
  try {
    await dbConnect();
    const projectsDb = await ProjectModel.find().sort({ createdAt: -1 }).lean();
    
    const projects = projectsDb.map(p => ({
      ...p,
      id: p._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = requireRole(request, []); // Only Admin can delete public projects
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await ProjectModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
