import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const { status } = await request.json();

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    // Only Admin or the assigned user can update the task
    if (auth.user.role !== 'Admin' && task.assignedTo.toString() !== auth.user.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized to update this task' }, { status: 401 });
    }

    if (status) task.status = status;
    await task.save();

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized || auth.user.role !== 'Admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized to delete tasks' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const task = await Task.findByIdAndDelete(id);
    if (!task) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
