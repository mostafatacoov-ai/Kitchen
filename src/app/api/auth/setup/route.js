import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    
    // Check if any users exist
    const count = await User.countDocuments();
    if (count > 0) {
      return NextResponse.json({ success: false, error: 'تم الإعداد مسبقاً. لا يمكن إنشاء مستخدم مسؤول جديد بهذه الطريقة.' }, { status: 403 });
    }

    const { username, password } = await request.json();

    if (!username || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'بيانات غير صالحة. يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      username,
      password: hashedPassword,
      role: 'Admin'
    });

    return NextResponse.json({ success: true, message: 'تم إنشاء حساب المسؤول بنجاح.' });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
