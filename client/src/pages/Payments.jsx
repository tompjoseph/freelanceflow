import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Trash2, Pencil, CreditCard, Calendar, AlertCircle, X, Check, Briefcase, ArrowRight } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const statusConfig = {
  paid: { label: 'Paid', className: 'badge-paid' },
  pending: { label: 'Pending', className: 'badge-pending' },
  overdue: { label: 'Overdue', className: 'badge-overdue' },
};

const emptyForm = (projectFilter) => ({
  project: projectFilter || '',
  advanceAmount: '',
  balanceAmount: '',
  currency: 'INR',
  paymentDate: new Date().toISOString().split('T')[0],
  status: 'pending',
  notes: '',
});

export default function Payments() {
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('project');
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm(projectFilter));
  const [editForm, setEditForm] = useState({});

  const fetchPayments = async () => {
    const params = projectFilter ? `?projectId=${projectFilter}` : '';
    const res = await api.get(`/payments${params}`);
    setPayments(res.data);
  };

  useEffect(() => {
    api.get('/projects').then((res) => setProjects(res.data));
    fetchPayments().finally(() => setLoading(false));
  }, [projectFilter]);

  const createPayment = async (e) => {
    e.preventDefault();
    await api.post('/payments', form);
    setForm(emptyForm(projectFilter));
    setShowForm(false);
    fetchPayments();
  };

  const startEdit = (payment) => {
    setEditingId(payment._id);
    setEditForm({
      advanceAmount: payment.advanceAmount || 0,
      balanceAmount: payment.balanceAmount || 0,
      currency: payment.currency,
      paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : '',
      status: payment.status,
      notes: payment.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    await api.put(`/payments/${id}`, {
      ...editForm,
      advanceAmount: Number(editForm.advanceAmount) || 0,
      balanceAmount: Number(editForm.balanceAmount) || 0,
    });
    setEditingId(null);
    setEditForm({});
    fetchPayments();
  };

  const deletePayment = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    await api.delete(`/payments/${id}`);
    fetchPayments();
  };

  const totalAdvance = payments.reduce((sum, p) => sum + (p.advanceAmount || 0), 0);
  const totalBalance = payments.reduce((sum, p) => sum + (p.balanceAmount || 0), 0);

  const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

  const grouped = useMemo(() => {
    const map = {};
    for (const p of payments) {
      const pid = p.project?._id || 'unknown';
      const pname = p.project?.title || 'Unknown Project';
      if (!map[pid]) map[pid] = { title: pname, payments: [] };
      map[pid].payments.push(p);
    }
    return Object.entries(map).map(([id, g]) => ({ id, ...g }));
  }, [payments]);

  if (loading) {
    return (
      <div className="page-container max-w-4xl">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
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
          {projectFilter ? 'Project Payments' : 'All Payments'}
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      {payments.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 mb-8 animate-fade-in">
          <div className="card-gradient p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-xl text-emerald-400 font-bold">₹</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalAdvance)}</p>
              <p className="text-sm text-gray-400">Total Advance</p>
            </div>
          </div>
          <div className="card-gradient p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
              <p className="text-sm text-gray-400">Total Balance</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={createPayment} className="card p-6 mb-8 space-y-4 animate-slide-up">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Advance Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.advanceAmount}
                onChange={(e) => setForm({ ...form, advanceAmount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Balance Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.balanceAmount}
                onChange={(e) => setForm({ ...form, balanceAmount: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input-field"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="sm:col-span-2">
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
            <button type="submit" className="btn-primary">
              Add Payment
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No payments recorded</p>
          <p className="text-gray-600 text-sm mt-1">Add your first payment to get started</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => {
            const groupAdvance = group.payments.reduce((s, p) => s + (p.advanceAmount || 0), 0);
            const groupBalance = group.payments.reduce((s, p) => s + (p.balanceAmount || 0), 0);
            return (
              <div key={group.id} className="animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                      <Briefcase size={15} className="text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">{group.title}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-400 font-medium">{formatCurrency(groupAdvance)}</span>
                    {groupBalance > 0 && (
                      <>
                        <ArrowRight size={12} className="text-gray-500" />
                        <span className="text-amber-400 font-medium">{formatCurrency(groupBalance)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {group.payments.map((payment, index) => {
                    const total = (payment.advanceAmount || 0) + (payment.balanceAmount || 0);
                    return (
                      <div
                        key={payment._id}
                        className="card-hover p-4"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        {editingId === payment._id ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Advance (₹)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editForm.advanceAmount}
                                  onChange={(e) => setEditForm({ ...editForm, advanceAmount: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Balance (₹)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editForm.balanceAmount}
                                  onChange={(e) => setEditForm({ ...editForm, balanceAmount: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                                <input
                                  type="text"
                                  value={editForm.currency}
                                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                                <input
                                  type="date"
                                  value={editForm.paymentDate}
                                  onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                                  className="input-field"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                <select
                                  value={editForm.status}
                                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                  className="input-field"
                                >
                                  <option value="paid">Paid</option>
                                  <option value="pending">Pending</option>
                                  <option value="overdue">Overdue</option>
                                </select>
                              </div>
                              <div>
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
                              <button onClick={() => saveEdit(payment._id)} className="btn-primary !py-2 !px-4">
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
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-white font-semibold">
                                  {payment.currency === 'INR' ? '₹' : payment.currency + ' '}{total.toFixed(2)}
                                </span>
                                <span className={statusConfig[payment.status]?.className}>{statusConfig[payment.status]?.label}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                <span className="text-emerald-400">Adv: {formatCurrency(payment.advanceAmount || 0)}</span>
                                <span className="text-amber-400">Bal: {formatCurrency(payment.balanceAmount || 0)}</span>
                                <span className="flex items-center gap-1.5 text-gray-400">
                                  <Calendar size={12} className="text-gray-500" />
                                  {formatDate(payment.paymentDate)}
                                </span>
                                {payment.notes && (
                                  <span className="text-gray-500">· {payment.notes}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-4">
                              <button
                                onClick={() => startEdit(payment)}
                                className="text-gray-600 hover:text-primary-400 transition-colors p-2 rounded-xl hover:bg-primary-500/5"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => deletePayment(payment._id)}
                                className="text-gray-600 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-500/5"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
