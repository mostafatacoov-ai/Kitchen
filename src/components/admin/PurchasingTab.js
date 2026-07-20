import { useState, useEffect } from 'react';
import { Loader2, Printer, CheckCircle, Clock } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function PurchasingTab({ userRole, token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/purchasing', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/purchasing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const addCost = async (id, amount) => {
    if (!amount || amount <= 0) return;
    try {
      const res = await fetch('/api/purchasing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ id, newExpense: { amount: Number(amount) } })
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const printPO = (po) => {
    const printWindow = window.open('', '_blank');
    const woodHtml = po.materials?.woodenBulks?.map(w => `<li>${w.bulkType} - ${w.color} - عدد ${w.numberOfBoards} (${w.purpose})</li>`).join('') || 'لا يوجد';
    const hingesHtml = po.materials?.accessories?.hinges?.map(h => `<li>مفصلة ${h.hingeType} (${h.brand}) - الكمية: ${h.quantity}</li>`).join('') || 'لا يوجد';
    const runnersHtml = po.materials?.accessories?.drawerRunners?.map(r => `<li>مجرى ${r.mountType} مقاس ${r.size} (${r.brand}) - الكمية: ${r.quantity}</li>`).join('') || 'لا يوجد';
    
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>طلب شراء - ${po.kitchenName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body onload="window.print();">
          <div class="header">
            <h1>طلب شراء (Purchase Order)</h1>
            <p><strong>اسم المشروع:</strong> ${po.kitchenName}</p>
            <p><strong>التاريخ:</strong> ${new Date(po.createdAt).toLocaleDateString('ar-EG')}</p>
          </div>
          
          <h3>المواد المطلوبة للشراء:</h3>
          <h4>الأخشاب:</h4>
          <ul>${woodHtml}</ul>
          <h4>الإكسسوارات:</h4>
          <ul>${hingesHtml}</ul>
          <ul>${runnersHtml}</ul>
          ${po.materials?.accessories?.skirting ? '<p><strong>ملاحظة:</strong> يوجد سكلو (Skirting)</p>' : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={styles.tabContentPanel}>
      <div className={styles.panelHeader}>
        <h2>المشتريات (Purchasing & Material Orders)</h2>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}><Loader2 className="animate-spin" size={40} /></div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>لا توجد طلبات شراء حالياً.</div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>المشروع / Project</th>
                <th>التكلفة الحالية / Cost</th>
                <th>الحالة / Status</th>
                <th>الإجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(po => (
                <tr key={po.id}>
                  <td>
                    <strong>{po.kitchenName}</strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{po.clientName}</div>
                  </td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{po.totalCost?.toLocaleString()} EGP</td>
                  <td>
                    <span style={{ 
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '4px', 
                      fontSize: '0.85rem',
                      background: po.status === 'Received' ? 'rgba(34,197,94,0.2)' : (po.status === 'Ordered' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'),
                      color: po.status === 'Received' ? '#4ade80' : (po.status === 'Ordered' ? '#60a5fa' : '#f87171')
                    }}>
                      {po.status === 'Pending' && 'قيد الانتظار'}
                      {po.status === 'Ordered' && 'تم الطلب'}
                      {po.status === 'Received' && 'تم الاستلام'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button onClick={() => printPO(po)} className={styles.submitBtn} style={{ padding: '0.3rem 0.6rem', width: 'auto', margin: 0, background: '#475569' }}>
                        <Printer size={14} /> طباعة الطلب
                      </button>

                      {po.status === 'Pending' && (
                        <button onClick={() => updateStatus(po.id, 'Ordered')} className={styles.submitBtn} style={{ padding: '0.3rem 0.6rem', width: 'auto', margin: 0, background: '#3b82f6' }}>
                          <Clock size={14} /> تأكيد الطلب
                        </button>
                      )}
                      
                      {po.status === 'Ordered' && (
                        <button onClick={() => updateStatus(po.id, 'Received')} className={styles.submitBtn} style={{ padding: '0.3rem 0.6rem', width: 'auto', margin: 0, background: '#10b981' }}>
                          <CheckCircle size={14} /> تأكيد الاستلام
                        </button>
                      )}

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="number" 
                          id={`cost-${po.id}`}
                          className={styles.formInput} 
                          placeholder="إضافة تكلفة (EGP)"
                          style={{ padding: '0.3rem', width: '130px', margin: 0 }}
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`cost-${po.id}`);
                            addCost(po.id, input.value);
                            input.value = '';
                          }}
                          className={styles.submitBtn}
                          style={{ padding: '0.3rem 0.6rem', width: 'auto', margin: 0, background: 'var(--orange)' }}
                        >
                          إضافة مبلغ
                        </button>
                      </div>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
