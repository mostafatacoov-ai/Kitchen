import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    // Admins can see all tasks, others see only their assigned tasks
    const query = auth.user.role === 'Admin' ? {} : { assignedTo: auth.user.userId };
    
    const tasks = await Task.find(query).populate('assignedTo', 'username role').sort({ dueDate: 1 });
    
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized || auth.user.role !== 'Admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized to create tasks' }, { status: 401 });
    }

    await dbConnect();
    const { title, description, assignedTo, dueDate, relatedEntity } = await request.json();

    if (!title || !assignedTo || !dueDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: auth.user.userId,
      dueDate,
      relatedEntity
    });

    // Create a notification for the assigned user
    await Notification.create({
      userId: assignedTo,
      message: `لديك مهمة جديدة: ${title}`,
      relatedTaskId: task._id
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}
