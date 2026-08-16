import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  try {
    const auth = requireRole(request, []); // Only Admin
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const { role, password } = await request.json();
    
    const updateData = {};
    if (role) updateData.role = role;
    if (password) {
      if (password.length < 6) {
         return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireRole(request, []); // Only Admin
    if (!auth.authorized) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    if (user.role === 'Admin') {
       // Prevent deleting the last admin
       const adminCount = await User.countDocuments({ role: 'Admin' });
       if (adminCount <= 1) {
          return NextResponse.json({ success: false, error: 'Cannot delete the last admin user' }, { status: 400 });
       }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
