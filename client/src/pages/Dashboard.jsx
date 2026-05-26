import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, ExternalLink, Briefcase, Clock, CheckCircle2, PauseCircle, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';

const statusConfig = {
  active: { label: 'Active', icon: Clock, className: 'badge-active' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'badge-completed' },
  'on-hold': { label: 'On Hold', icon: PauseCircle, className: 'badge-on-hold' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'active', startDate: new Date().toISOString().split('T')[0], endDate: '' });
  const [payment, setPayment] = useState({ advance: '', balance: '', currency: 'INR', status: 'pending', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    const res = await api.post('/projects', {
      ...form,
      paymentAdvance: payment.advance || undefined,
      paymentBalance: payment.balance || undefined,
      paymentCurrency: payment.currency,
      paymentStatus: payment.status,
      paymentDate: payment.paymentDate,
      paymentNotes: payment.notes,
    });
    setForm({ title: '', description: '', status: 'active', startDate: new Date().toISOString().split('T')[0], endDate: '' });
    setPayment({ advance: '', balance: '', currency: 'INR', status: 'pending', paymentDate: new Date().toISOString().split('T')[0], notes: '' });
    setShowPaymentFields(false);
    setShowForm(false);
    navigate(`/projects/${res.data._id}`);
  };

  const counts = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    onHold: projects.filter((p) => p.status === 'on-hold').length,
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
          <div className="skeleton h-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={createProject} className="card p-6 mb-8 space-y-4 animate-slide-up">
          <div>
            <input
              type="text"
              placeholder="Project title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPaymentFields(!showPaymentFields)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
              showPaymentFields
                ? 'border-primary-500/30 bg-primary-500/5'
                : 'border-white/10 bg-white/[0.02] hover:border-primary-500/20 hover:bg-primary-500/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                showPaymentFields ? 'bg-primary-500/20' : 'bg-white/5'
              }`}>
                <CreditCard size={18} className={showPaymentFields ? 'text-primary-400' : 'text-gray-500'} />
              </div>
              <div className="text-left">
                <span className={`text-sm font-medium transition-colors ${showPaymentFields ? 'text-primary-300' : 'text-gray-400'}`}>
                  {showPaymentFields ? 'Payment details' : 'Add payment details'}
                </span>
                <p className="text-xs text-gray-600">Record a payment for this project</p>
              </div>
            </div>
            {showPaymentFields ? <ChevronUp size={18} className="text-primary-400" /> : <ChevronDown size={18} className="text-gray-500" />}
          </button>

          {showPaymentFields && (
            <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-slide-up -mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Advance Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={payment.advance}
                  onChange={(e) => setPayment({ ...payment, advance: e.target.value })}
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
                  value={payment.balance}
                  onChange={(e) => setPayment({ ...payment, balance: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>
              <div className="sm:col-span-2">
                <div className="p-3 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Total Cost</span>
                  <span className="text-lg font-bold text-primary-400">
                    ₹{((Number(payment.advance) || 0) + (Number(payment.balance) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                <input
                  type="text"
                  value={payment.currency}
                  onChange={(e) => setPayment({ ...payment, currency: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={payment.paymentDate}
                  onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={payment.status}
                  onChange={(e) => setPayment({ ...payment, status: e.target.value })}
                  className="input-field"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                <input
                  type="text"
                  value={payment.notes}
                  onChange={(e) => setPayment({ ...payment, notes: e.target.value })}
                  className="input-field"
                  placeholder="Payment notes"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="btn-primary"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-3 mb-8 animate-fade-in">
        <div className="card-gradient p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Briefcase size={22} className="text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{counts.total}</p>
            <p className="text-sm text-gray-400">Total Projects</p>
          </div>
        </div>
        <div className="card-gradient p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{counts.active}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
        </div>
        <div className="card-gradient p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CheckCircle2 size={22} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{counts.completed}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg font-medium">No projects yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const StatusIcon = statusConfig[project.status]?.icon || Clock;
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card-hover p-6 group"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg group-hover:text-primary-400 transition-colors">
                    {project.title}
                  </h3>
                  <ExternalLink size={15} className="text-gray-600 group-hover:text-primary-400 transition-colors shrink-0 mt-1" />
                </div>
                {project.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <StatusIcon size={12} className={
                    project.status === 'active' ? 'text-emerald-400' :
                    project.status === 'completed' ? 'text-blue-400' : 'text-amber-400'
                  } />
                  <span className={statusConfig[project.status]?.className || 'badge'}>{statusConfig[project.status]?.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
