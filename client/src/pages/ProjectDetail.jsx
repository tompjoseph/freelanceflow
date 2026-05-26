import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Trash2, Save, Clock, CheckCircle2, PauseCircle, CreditCard, Globe } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'badge-active' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'badge-completed' },
  'on-hold': { label: 'On Hold', icon: PauseCircle, className: 'badge-on-hold' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => {
        setProject(res.data);
        setForm(res.data);
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await api.put(`/projects/${id}`, form);
    setProject(res.data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="skeleton h-64" />
      </div>
    );
  }

  if (!project) return null;

  const StatusIcon = statusConfig[project.status]?.icon || Clock;

  return (
    <div className="page-container max-w-3xl">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all duration-200 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </button>

      {editing ? (
        <form onSubmit={handleUpdate} className="card p-6 space-y-5 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              rows={4}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={form.endDate ? form.endDate.split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary"
            >
              <Save size={16} />
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(project); }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="card p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <StatusIcon size={18} className={
                  project.status === 'active' ? 'text-emerald-400' :
                  project.status === 'completed' ? 'text-blue-400' : 'text-amber-400'
                } />
                <h1 className="text-2xl font-bold text-white truncate">{project.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className={statusConfig[project.status]?.className}>{statusConfig[project.status]?.label}</span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0 ml-4">
              <button
                onClick={() => setEditing(true)}
                className="btn-ghost text-sm px-3 py-2"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger text-sm px-3 py-2"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>

          {project.description && (
            <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                <Clock size={14} className="text-primary-400" />
              </div>
              <div>
                <span className="block text-gray-500 text-xs">Started</span>
                <span className="text-gray-200 font-medium">{formatDate(project.startDate)}</span>
              </div>
            </div>
            {project.endDate && (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock size={14} className="text-amber-400" />
                </div>
                <div>
                  <span className="block text-gray-500 text-xs">Deadline</span>
                  <span className="text-gray-200 font-medium">{formatDate(project.endDate)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 animate-fade-in">
        <button
          onClick={() => navigate(`/payments?project=${id}`)}
          className="card-hover p-6 text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CreditCard size={22} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Payments</h3>
            <p className="text-sm text-gray-400">View and manage payments</p>
          </div>
        </button>
        <button
          onClick={() => navigate(`/domains?project=${id}`)}
          className="card-hover p-6 text-left flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Globe size={22} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Domain & Hosting</h3>
            <p className="text-sm text-gray-400">Manage domain and hosting details</p>
          </div>
        </button>
      </div>
    </div>
  );
}
