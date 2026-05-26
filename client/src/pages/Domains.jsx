import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Trash2, Pencil, Globe, AlertTriangle, CalendarDays, X, Check } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

function daysUntil(date) {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function ExpiryBadge({ days }) {
  if (days === null) return null;
  if (days < 0) return <span className="badge bg-red-500/10 text-red-400 border-red-500/20">Expired</span>;
  if (days <= 7) return <span className="badge bg-red-500/10 text-red-400 border-red-500/20">{days}d left</span>;
  if (days <= 14) return <span className="badge bg-amber-500/10 text-amber-400 border-amber-500/20">{days}d left</span>;
  if (days <= 30) return <span className="badge bg-blue-500/10 text-blue-400 border-blue-500/20">{days}d left</span>;
  return <span className="badge bg-white/5 text-gray-400 border-white/10">{days}d left</span>;
}

const emptyForm = (projectFilter) => ({
  project: projectFilter || '',
  domainName: '',
  domainProvider: '',
  domainExpiryDate: '',
  hostingProvider: '',
  hostingExpiryDate: '',
  renewalCost: '',
  notes: '',
});

export default function Domains() {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project');
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm(projectFilter));
  const [editForm, setEditForm] = useState({});

  const fetchEntries = async () => {
    const params = projectFilter ? `?projectId=${projectFilter}` : '';
    const res = await api.get(`/domains${params}`);
    setEntries(res.data);
  };

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data));
    fetchEntries().finally(() => setLoading(false));
  }, [projectFilter]);

  const createEntry = async (e) => {
    e.preventDefault();
    await api.post('/domains', {
      ...form,
      renewalCost: form.renewalCost ? Number(form.renewalCost) : 0,
    });
    setForm(emptyForm(projectFilter));
    setShowForm(false);
    fetchEntries();
  };

  const startEdit = (entry) => {
    setEditingId(entry._id);
    setEditForm({
      domainName: entry.domainName || '',
      domainProvider: entry.domainProvider || '',
      domainExpiryDate: entry.domainExpiryDate ? entry.domainExpiryDate.split('T')[0] : '',
      hostingProvider: entry.hostingProvider || '',
      hostingExpiryDate: entry.hostingExpiryDate ? entry.hostingExpiryDate.split('T')[0] : '',
      renewalCost: entry.renewalCost || '',
      notes: entry.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    await api.put(`/domains/${id}`, {
      ...editForm,
      renewalCost: editForm.renewalCost ? Number(editForm.renewalCost) : 0,
    });
    setEditingId(null);
    setEditForm({});
    fetchEntries();
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await api.delete(`/domains/${id}`);
    fetchEntries();
  };

  const expiringCount = entries.filter((e) => {
    const dDays = daysUntil(e.domainExpiryDate);
    const hDays = daysUntil(e.hostingExpiryDate);
    return (dDays !== null && dDays <= 30) || (hDays !== null && hDays <= 30);
  }).length;

  const totalRenewalCost = entries.reduce((sum, e) => sum + (e.renewalCost || 0), 0);

  if (loading) {
    return (
      <div className="page-container max-w-4xl">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
        <div className="skeleton h-32" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="page-header">
        <h1 className="page-title">
          {projectFilter ? 'Project Domains & Hosting' : 'Domains & Hosting'}
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Entry
        </button>
      </div>

      {entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3 mb-8 animate-fade-in">
          <div className="card-gradient p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Globe size={22} className="text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{entries.length}</p>
              <p className="text-sm text-gray-400">Total Entries</p>
            </div>
          </div>
          <div className="card-gradient p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{expiringCount}</p>
              <p className="text-sm text-gray-400">Expiring Soon</p>
            </div>
          </div>
          <div className="card-gradient p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xl text-emerald-400 font-bold">₹</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{totalRenewalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Total Renewal Cost</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={createEntry} className="card p-6 mb-8 space-y-4 animate-slide-up">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project</label>
              <select
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain Name</label>
              <input
                type="text"
                value={form.domainName}
                onChange={(e) => setForm({ ...form, domainName: e.target.value })}
                className="input-field"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain Provider</label>
              <input
                type="text"
                value={form.domainProvider}
                onChange={(e) => setForm({ ...form, domainProvider: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Domain Expiry</label>
              <input
                type="date"
                value={form.domainExpiryDate}
                onChange={(e) => setForm({ ...form, domainExpiryDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hosting Provider</label>
              <input
                type="text"
                value={form.hostingProvider}
                onChange={(e) => setForm({ ...form, hostingProvider: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hosting Expiry</label>
              <input
                type="date"
                value={form.hostingExpiryDate}
                onChange={(e) => setForm({ ...form, hostingExpiryDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Renewal Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.renewalCost}
                onChange={(e) => setForm({ ...form, renewalCost: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Add Entry</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Globe size={28} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No domain or hosting entries</p>
          <p className="text-gray-600 text-sm mt-1">Add your first entry to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const domainDays = daysUntil(entry.domainExpiryDate);
            const hostingDays = daysUntil(entry.hostingExpiryDate);
            return (
              <div
                key={entry._id}
                className="card-hover p-5"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {editingId === entry._id ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Domain Name</label>
                        <input
                          type="text"
                          value={editForm.domainName}
                          onChange={(e) => setEditForm({ ...editForm, domainName: e.target.value })}
                          className="input-field"
                          placeholder="example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Domain Provider</label>
                        <input
                          type="text"
                          value={editForm.domainProvider}
                          onChange={(e) => setEditForm({ ...editForm, domainProvider: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Domain Expiry</label>
                        <input
                          type="date"
                          value={editForm.domainExpiryDate}
                          onChange={(e) => setEditForm({ ...editForm, domainExpiryDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hosting Provider</label>
                        <input
                          type="text"
                          value={editForm.hostingProvider}
                          onChange={(e) => setEditForm({ ...editForm, hostingProvider: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Hosting Expiry</label>
                        <input
                          type="date"
                          value={editForm.hostingExpiryDate}
                          onChange={(e) => setEditForm({ ...editForm, hostingExpiryDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Renewal Cost (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.renewalCost}
                          onChange={(e) => setEditForm({ ...editForm, renewalCost: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                        <input
                          type="text"
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(entry._id)} className="btn-primary !py-2 !px-4">
                        <Check size={14} />
                        Save
                      </button>
                      <button onClick={cancelEdit} className="btn-ghost !py-2 !px-4">
                        <X size={14} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                          <Globe size={18} className="text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold truncate">
                              {entry.domainName || 'Domain Entry'}
                            </span>
                            {entry.renewalCost > 0 && (
                              <span className="text-sm text-gray-400">₹{Number(entry.renewalCost).toFixed(2)}/yr</span>
                            )}
                          </div>
                          {entry.project?.title && (
                            <span className="text-sm text-gray-500">{entry.project.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <button
                          onClick={() => startEdit(entry)}
                          className="text-gray-600 hover:text-primary-400 transition-colors p-2 rounded-xl hover:bg-primary-500/5"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry._id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/5"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {entry.domainName && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <span className="text-gray-500">Domain:</span>
                          <span className="text-gray-300">{entry.domainProvider || 'N/A'}</span>
                          {domainDays !== null && <ExpiryBadge days={domainDays} />}
                        </div>
                      )}
                      {entry.hostingProvider && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <span className="text-gray-500">Hosting:</span>
                          <span className="text-gray-300">{entry.hostingProvider}</span>
                          {hostingDays !== null && <ExpiryBadge days={hostingDays} />}
                        </div>
                      )}
                      {entry.domainExpiryDate && !entry.hostingProvider && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <CalendarDays size={14} className="text-gray-500" />
                          <span className="text-gray-500">Expires:</span>
                          <span className="text-gray-300">{formatDate(entry.domainExpiryDate)}</span>
                          <ExpiryBadge days={domainDays} />
                        </div>
                      )}
                      {entry.domainExpiryDate && entry.hostingExpiryDate && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-500">
                          <CalendarDays size={14} className="text-gray-500" />
                          Domain expires: {formatDate(entry.domainExpiryDate)}
                        </div>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-white/[0.04]">{entry.notes}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
