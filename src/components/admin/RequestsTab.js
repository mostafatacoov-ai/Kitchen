import { Loader2, Trash2, Calendar, Phone, MapPin, Sparkles } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function RequestsTab({ requests, loading, deletingId, handleDeleteRequest }) {
  const stats = {
    total: requests.length,
    modern: requests.filter(r => r.style === 'modern').length,
    classic: requests.filter(r => r.style === 'classic').length,
    neoClassic: requests.filter(r => r.style === 'neo-classic').length,
  };

  return (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>إجمالي الطلبات</h3>
          <div className={styles.statNumber}>{stats.total}</div>
        </div>
        <div className={styles.statCard}>
          <h3>مطابخ مودرن</h3>
          <div className={styles.statNumber} style={{ color: 'var(--orange)' }}>{stats.modern}</div>
        </div>
        <div className={styles.statCard}>
          <h3>مطابخ كلاسيك</h3>
          <div className={styles.statNumber} style={{ color: 'var(--gold)' }}>{stats.classic}</div>
        </div>
        <div className={styles.statCard}>
          <h3>نيو كلاسيك</h3>
          <div className={styles.statNumber} style={{ color: '#5b89ba' }}>{stats.neoClassic}</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loaderWrapper}>
            <Loader2 className="animate-spin" size={40} />
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>لا توجد طلبات تصميم حتى الآن.</p>
          </div>
        ) : (
          <table className={styles.requestsTable}>
            <thead>
              <tr>
                <th>الاسم الكامل / Name</th>
                <th>الهاتف / Phone</th>
                <th>المساحة / Area</th>
                <th>الستايل / Style</th>
                <th>تاريخ الطلب / Date</th>
                <th>إجراءات / Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className={styles.clientName}>{req.name}</td>
                  <td>
                    <div className={styles.phoneGroup}>
                      <span dir="ltr">{req.phone}</span>
                      <a href={`tel:${req.phone}`} className={styles.actionIcon} title="اتصال هاتفي">
                        <Phone size={16} />
                      </a>
                      <a 
                        href={`https://wa.me/${req.phone.replace(/[\s\+]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.actionIcon} 
                        style={{ color: '#25D366' }}
                      >
                        WS
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className={styles.iconCell}>
                      <MapPin size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span>{req.area}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.iconCell}>
                      <Sparkles size={16} style={{ color: 'var(--gold)' }} />
                      <span className={styles.styleBadge}>
                        {req.style === 'modern' ? 'مودرن' : req.style === 'classic' ? 'كلاسيك' : req.style === 'neo-classic' ? 'نيو كلاسيك' : req.style}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.iconCell}>
                      <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span>{new Date(req.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className={styles.deleteBtn}
                      disabled={deletingId === req.id}
                    >
                      {deletingId === req.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
