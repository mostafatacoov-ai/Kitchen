import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import RequestModel from '@/models/Request';

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { name, phone, area, style } = data;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    const newRequest = await RequestModel.create({
      name,
      phone,
      area: area || 'N/A',
      style: style || 'N/A',
    });

    // Trigger WhatsApp notification if configured
    const whatsappPhone = process.env.WHATSAPP_PHONE;
    const whatsappApiKey = process.env.WHATSAPP_APIKEY;

    if (whatsappPhone && whatsappApiKey) {
      const cleanPhone = whatsappPhone.replace(/[\s\+]/g, '');
      const message = `*تنبيه تصميم جديد!* 🛠️\n\n*الاسم:* ${name}\n*رقم الهاتف:* ${phone}\n*المساحة:* ${area || 'غير محددة'}\n*الستايل:* ${style || 'غير محدد'}\n\nيرجى الدخول للوحة التحكم للمراجعة.`;
      const encodedMsg = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMsg}&apikey=${whatsappApiKey}`;

      try {
        await fetch(url);
      } catch (err) {
        console.error('CallMeBot notification failed:', err);
      }
    }

    // Convert to plain object to match old response shape slightly
    const requestObject = {
      id: newRequest._id.toString(),
      name: newRequest.name,
      phone: newRequest.phone,
      area: newRequest.area,
      style: newRequest.style,
      createdAt: newRequest.createdAt.toISOString()
    };

    return NextResponse.json({ success: true, request: requestObject });

  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
