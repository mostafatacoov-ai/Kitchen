import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CRMLead from '@/models/CRMLead';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { requireRole, verifyAuth } from '@/lib/auth';

export async function POST(request) {
  const auth = requireRole(request, ['Sales']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const data = await request.json();
    
    // If adding a comment to an existing lead
    if (data.action === 'add_comment') {
      const { leadId, text } = data;
      const lead = await CRMLead.findById(leadId);
      if (!lead) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
      
      lead.comments.push({ author: auth.user.username, text });
      await lead.save();
      return NextResponse.json({ success: true, lead: { ...lead.toObject(), id: lead._id.toString(), _id: undefined } });
    }

    // Creating new lead
    const lead = await CRMLead.create(data);
    
    // Automatically generate a task for the user who added it (to follow up in 2 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    
    const task = await Task.create({
      title: `متابعة العميل: ${lead.clientName}`,
      description: `متابعة العميل الجديد برقم ${lead.phone}`,
      assignedTo: auth.user.userId,
      createdBy: auth.user.userId,
      dueDate,
      relatedEntity: 'CRMLead'
    });
    
    await Notification.create({
      userId: auth.user.userId,
      message: `تم إنشاء مهمة تلقائية لمتابعة العميل ${lead.clientName}`,
      relatedTaskId: task._id
    });

    return NextResponse.json({ success: true, lead: { ...lead.toObject(), id: lead._id.toString(), _id: undefined } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request) {
  const auth = requireRole(request, ['Sales']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const leadsDb = await CRMLead.find().sort({ createdAt: -1 }).lean();
    
    const leads = leadsDb.map(l => ({
      ...l,
      id: l._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = requireRole(request, ['Sales']);
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const { id, ...updateData } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    const updated = await CRMLead.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });

    return NextResponse.json({ success: true, lead: { ...updated, id: updated._id.toString(), _id: undefined } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = requireRole(request, ['Sales']); // Admin is always allowed
  if (auth.error) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });

  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });

    await CRMLead.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
