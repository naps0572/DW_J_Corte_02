import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface TicketUser { id: number; name: string; email: string; }
interface Category { id: number; name: string; }
interface Ticket {
  id: number; title: string; description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  creator: TicketUser; technician?: TicketUser | null;
  category: Category; comments: { id: number }[];
}

const STATUS_LABEL = { OPEN: 'Abierto', IN_PROGRESS: 'En proceso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado' };
const STATUS_CLASS = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' };
const PRIORITY_LABEL = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };
const PRIORITY_CLASS = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' };

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function DashboardPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Ticket[]>('/tickets', { token });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los tickets');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const totals = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  }), [tickets]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{user?.role === 'TECHNICIAN' ? 'Panel de técnico' : 'Mi panel'}</h2>
          <p>Consulta y da seguimiento a los casos de soporte</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Nuevo ticket
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total tickets</div>
          <div className="stat-value">{totals.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Abiertos</div>
          <div className="stat-value indigo">{totals.open}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">En proceso</div>
          <div className="stat-value amber">{totals.inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resueltos</div>
          <div className="stat-value green">{totals.resolved}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{user?.role === 'TECHNICIAN' ? 'Todos los tickets' : 'Mis tickets'}</h3>
          <div className="card-actions">
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{tickets.length} registros</span>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ margin: '12px 16px' }}>{error}</div>}

        {loading ? (
          <div className="centered" style={{ minHeight: '160px' }}>
            <div className="spinner"></div>
            Cargando tickets...
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Prioridad</th>
                  <th>Solicitante</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="td-id">#{ticket.id}</td>
                    <td style={{ fontWeight: 500, color: '#111827', maxWidth: '220px' }}>
                      <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.title}
                      </span>
                    </td>
                    <td style={{ color: '#6B7280' }}>{ticket.category.name}</td>
                    <td><span className={`badge ${STATUS_CLASS[ticket.status]}`}>{STATUS_LABEL[ticket.status]}</span></td>
                    <td><span className={`badge ${PRIORITY_CLASS[ticket.priority]}`}>{PRIORITY_LABEL[ticket.priority]}</span></td>
                    <td>
                      <div className="creator-cell">
                        <div className="mini-avatar">{initials(ticket.creator.name)}</div>
                        <span style={{ color: '#374151' }}>{ticket.creator.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#9CA3AF', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </td>
                    <td>
                      <Link to={`/tickets/${ticket.id}`} style={{ fontSize: '12px', fontWeight: 600, color: '#4F46E5', whiteSpace: 'nowrap' }}>
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
                {!tickets.length && (
                  <tr className="td-empty">
                    <td colSpan={8}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg>
                        No hay tickets registrados todavía.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
