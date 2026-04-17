import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface TicketUser { id: number; name: string; email: string; }
interface Category { id: number; name: string; }
interface Comment { id: number; message: string; }

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  creator: TicketUser;
  technician?: TicketUser | null;
  category: Category;
  comments: Comment[];
}

const STATUS_LABELS: Record<Ticket['status'], string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En proceso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado'
};
const PRIORITY_LABELS: Record<Ticket['priority'], string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta'
};
const STATUS_CLASS: Record<Ticket['status'], string> = {
  OPEN: 'badge badge-open', IN_PROGRESS: 'badge badge-inprogress',
  RESOLVED: 'badge badge-resolved', CLOSED: 'badge badge-closed'
};
const PRIORITY_CLASS: Record<Ticket['priority'], string> = {
  LOW: 'badge badge-low', MEDIUM: 'badge badge-medium', HIGH: 'badge badge-high'
};

export function DashboardPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      setLoading(true);
      try {
        const data = await apiFetch<Ticket[]>('/tickets', { token });
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los tickets');
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, [token]);

  const totals = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length
  }), [tickets]);

  return (
    <section>
      <div className="grid cards-grid">
        <div className="card stat-card"><h3>Total</h3><strong>{totals.total}</strong></div>
        <div className="card stat-card"><h3>Abiertos</h3><strong className="text-open">{totals.open}</strong></div>
        <div className="card stat-card"><h3>En proceso</h3><strong className="text-inprogress">{totals.inProgress}</strong></div>
        <div className="card stat-card"><h3>Resueltos</h3><strong className="text-resolved">{totals.resolved}</strong></div>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <h2>{user?.role === 'TECHNICIAN' ? 'Todos los tickets' : 'Mis tickets'}</h2>
            <p>Consulta el detalle y seguimiento de los casos.</p>
          </div>
          <Link className="primary-link" to="/tickets/new">+ Crear ticket</Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        {loading ? (
          <div className="centered">Cargando tickets...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Título</th><th>Categoría</th><th>Estado</th>
                  <th>Prioridad</th><th>Solicitante</th><th>Fecha</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.category.name}</td>
                    <td><span className={STATUS_CLASS[ticket.status]}>{STATUS_LABELS[ticket.status]}</span></td>
                    <td><span className={PRIORITY_CLASS[ticket.priority]}>{PRIORITY_LABELS[ticket.priority]}</span></td>
                    <td>{ticket.creator.name}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString('es-CO')}</td>
                    <td><Link to={`/tickets/${ticket.id}`}>Ver detalle</Link></td>
                  </tr>
                ))}
                {!tickets.length && (
                  <tr><td colSpan={8}>No hay tickets registrados todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
