import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface TicketUser {
  id: number;
  name: string;
  email: string;
}

interface Category {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  message: string;
}

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

export function DashboardPage() {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await apiFetch<Ticket[]>('/tickets', { token });
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los tickets');
      }
    }

    loadTickets();
  }, [token]);

  const totals = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED').length
    };
  }, [tickets]);

  return (
    <section>
      <div className="grid cards-grid">
        <div className="card"><h3>Total</h3><strong>{totals.total}</strong></div>
        <div className="card"><h3>Abiertos</h3><strong>{totals.open}</strong></div>
        <div className="card"><h3>En proceso</h3><strong>{totals.inProgress}</strong></div>
        <div className="card"><h3>Resueltos</h3><strong>{totals.resolved}</strong></div>
      </div>

      <div className="card">
        <div className="section-header">
          <div>
            <h2>{user?.role === 'TECHNICIAN' ? 'Todos los tickets' : 'Mis tickets'}</h2>
            <p>Consulta el detalle y seguimiento de los casos.</p>
          </div>
          <Link className="primary-link" to="/tickets/new">Crear ticket</Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Solicitante</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.category.name}</td>
                  <td>{ticket.status}</td>
                  <td>{ticket.priority}</td>
                  <td>{ticket.creator.name}</td>
                  <td><Link to={`/tickets/${ticket.id}`}>Ver detalle</Link></td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={7}>No hay tickets registrados todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
