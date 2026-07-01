import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, phone, area, style } = data;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and phone are required' }, { status: 400 });
    }

    // Save to requests.json
    const filePath = path.join(process.cwd(), 'src/data/requests.json');
    let requests = [];
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      requests = JSON.parse(fileData || '[]');
    }

    const newRequest = {
      id: Date.now().toString(),
      name,
      phone,
      area: area || 'N/A',
      style: style || 'N/A',
      createdAt: new Date().toISOString(),
    };

    requests.push(newRequest);
    fs.writeFileSync(filePath, JSON.stringify(requests, null, 2), 'utf8');

    // Trigger WhatsApp notification if configured
    const whatsappPhone = process.env.WHATSAPP_PHONE;
    const whatsappApiKey = process.env.WHATSAPP_APIKEY;

    if (whatsappPhone && whatsappApiKey) {
      // Clear any "+" sign or spaces in phone
      const cleanPhone = whatsappPhone.replace(/[\s\+]/g, '');
      const message = `*تنبيه تصميم جديد!* 🛠️\n\n*الاسم:* ${name}\n*رقم الهاتف:* ${phone}\n*المساحة:* ${area || 'غير محددة'}\n*الستايل:* ${style || 'غير محدد'}\n\nيرجى الدخول للوحة التحكم للمراجعة.`;
      const encodedMsg = encodeURIComponent(message);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMsg}&apikey=${whatsappApiKey}`;
      
      // Await request to callmebot to ensure host platforms (like Hostinger/Vercel) do not terminate the process beforehand
      try {
        await fetch(url);
      } catch (err) {
        console.error('CallMeBot notification failed:', err);
      }
    }

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
