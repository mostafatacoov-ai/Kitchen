import { Loader2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import styles from '@/app/admin/Admin.module.css';

export default function ProjectsTab({ 
  projects, 
  handleDeleteProject, 
  deletingId, 
  handleProjectSubmit, 
  newProject, 
  setNewProject, 
  setImages, 
  uploading 
}) {
  return (
    <div className={styles.projectsManager}>
      <div className={styles.projectFormCard}>
        <h2>إضافة مشروع جديد / Add New Project</h2>
        <form onSubmit={handleProjectSubmit} className={styles.formGrid}>
          
          <div className={styles.formGroup}>
            <label>اسم المشروع (عربي)</label>
            <input 
              type="text" 
              className={styles.formInput} 
              required
              value={newProject.titleAr}
              onChange={e => setNewProject({...newProject, titleAr: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Project Name (English)</label>
            <input 
              type="text" 
              className={styles.formInput} 
              required
              value={newProject.titleEn}
              onChange={e => setNewProject({...newProject, titleEn: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>التصنيف / Category</label>
            <select 
              className={styles.formInput}
              value={newProject.category}
              onChange={e => setNewProject({...newProject, category: e.target.value})}
            >
              <option value="Modern">Modern / مودرن</option>
              <option value="Classic">Classic / كلاسيك</option>
              <option value="Semi-Classic">Semi-Classic / نيو كلاسيك</option>
              <option value="custom">إضافة تصنيف جديد / Add Custom</option>
            </select>
          </div>

          {newProject.category === 'custom' && (
            <div className={styles.formGroup}>
              <label>التصنيف الجديد / Custom Category</label>
              <input 
                type="text" 
                className={styles.formInput} 
                placeholder="e.g. Minimalist"
                value={newProject.customCategory || ''}
                onChange={e => setNewProject({...newProject, customCategory: e.target.value})}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>الوصف (عربي)</label>
            <textarea 
              className={styles.formInput}
              value={newProject.descAr}
              onChange={e => setNewProject({...newProject, descAr: e.target.value})}
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label>Description (English)</label>
            <textarea 
              className={styles.formInput}
              value={newProject.descEn}
              onChange={e => setNewProject({...newProject, descEn: e.target.value})}
            ></textarea>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>صور المشروع / Project Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/*"
              className={styles.formInput}
              onChange={e => setImages(e.target.files)}
              required
            />
            <small style={{ color: 'var(--text-secondary)' }}>
              يمكنك تحديد عدة صور مرة واحدة. الصورة الأولى ستكون الغلاف.
            </small>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <button type="submit" className={styles.submitBtn} disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={20} />}
              <span>{uploading ? 'جاري الرفع...' : 'رفع المشروع / Upload Project'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className={styles.projectList}>
        {projects.map(project => (
          <div key={project.id} className={styles.projectCard}>
            <img src={project.images[0]} alt={project.title.en} className={styles.projectImage} />
            <button 
              className={styles.deleteProjectBtn}
              onClick={() => handleDeleteProject(project.id)}
              disabled={deletingId === project.id}
            >
              {deletingId === project.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            </button>
            <div className={styles.projectInfo}>
              <span className={styles.projectCategory}>{project.category}</span>
              <h3>{project.title.ar} / {project.title.en}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', alignItems: 'center' }}>
                <ImageIcon size={14} />
                <span>{project.images.length} صور / Photos</span>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            لا توجد مشاريع مضافة بعد / No projects added yet
          </div>
        )}
      </div>
    </div>
  );
}
