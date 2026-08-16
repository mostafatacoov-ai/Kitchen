import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    
    const notifications = await Notification.find({ userId: auth.user.userId, isRead: false }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = verifyAuth(request);
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await request.json();

    if (id) {
       // mark specific as read
       await Notification.findOneAndUpdate({ _id: id, userId: auth.user.userId }, { isRead: true });
    } else {
       // mark all as read
       await Notification.updateMany({ userId: auth.user.userId, isRead: false }, { isRead: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 });
  }
}
