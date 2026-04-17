import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Category { id: number; name: string; }
interface UserInfo { id: number; name: string; email: string; role?: 'USER' | 'TECHNICIAN'; }
interface CommentItem { id: number; message: string; createdAt: string; user: UserInfo; }

interface TicketDetail {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  creator: UserInfo;
  technician?: UserInfo | null;
  category: Category;
  comments: CommentItem[];
}

const STATUS_LABELS: Record<TicketDetail['status'], string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En proceso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado'
};
const PRIORITY_LABELS: Record<TicketDetail['priority'], string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta'
};
const STATUS_CLASS: Record<TicketDetail['status'], string> = {
  OPEN: 'badge badge-open', IN_PROGRESS: 'badge badge-inprogress',
  RESOLVED: 'badge badge-resolved', CLOSED: 'badge badge-closed'
};

export function TicketDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<TicketDetail['status']>('OPEN');
  const [priority, setPriority] = useState<TicketDetail['priority']>('MEDIUM');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // FIX: useCallback para poder incluir loadTicket en deps de useEffect
  const loadTicket = useCallback(async () => {
    try {
      const data = await apiFetch<TicketDetail>(`/tickets/${id}`, { token });
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el ticket');
    }
  }, [id, token]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]); // FIX: dep array correcto

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/tickets/${id}/comments`, {
        method: 'POST',
        token,
        body: JSON.stringify({ message })
      });
      setMessage('');
      setSuccess('Comentario agregado correctamente');
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el comentario');
    }
  }

  async function handleUpdate() {
    setError('');
    setSuccess('');
    try {
      await apiFetch(`/tickets/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status, priority })
      });
      setSuccess('Ticket actualizado correctamente');
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el ticket');
    }
  }

  if (!ticket) {
    return <div className="centered">{error || 'Cargando ticket...'}</div>;
  }

  return (
    <section className="grid detail-grid">
      <article className="card">
        <h2>{ticket.title}</h2>
        <p>{ticket.description}</p>
        <div className="meta-grid">
          <span><strong>ID:</strong> #{ticket.id}</span>
          <span>
            <strong>Estado:</strong>{' '}
            <span className={STATUS_CLASS[ticket.status]}>{STATUS_LABELS[ticket.status]}</span>
          </span>
          <span><strong>Prioridad:</strong> {PRIORITY_LABELS[ticket.priority]}</span>
          <span><strong>Categoría:</strong> {ticket.category.name}</span>
          <span><strong>Solicitante:</strong> {ticket.creator.name}</span>
          {ticket.technician && (
            <span><strong>Técnico:</strong> {ticket.technician.name}</span>
          )}
          <span><strong>Creado:</strong> {new Date(ticket.createdAt).toLocaleString('es-CO')}</span>
        </div>

        {user?.role === 'TECHNICIAN' && (
          <div className="form-grid bordered-top">
            <h3>Actualizar ticket</h3>
            <label>
              Estado
              <select value={status} onChange={(e) => setStatus(e.target.value as TicketDetail['status'])}>
                <option value="OPEN">Abierto</option>
                <option value="IN_PROGRESS">En proceso</option>
                <option value="RESOLVED">Resuelto</option>
                <option value="CLOSED">Cerrado</option>
              </select>
            </label>
            <label>
              Prioridad
              <select value={priority} onChange={(e) => setPriority(e.target.value as TicketDetail['priority'])}>
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
            </label>
            {error && <div className="alert error">{error}</div>}
            {success && <div className="alert success">{success}</div>}
            <button type="button" onClick={handleUpdate}>Actualizar ticket</button>
          </div>
        )}
      </article>

      <aside className="card">
        <h3>Comentarios ({ticket.comments.length})</h3>
        <div className="comments-list">
          {ticket.comments.map((comment) => (
            <div key={comment.id} className={`comment-item ${comment.user.role === 'TECHNICIAN' ? 'comment-tech' : ''}`}>
              <strong>{comment.user.name}</strong>
              {comment.user.role === 'TECHNICIAN' && <span className="badge badge-tech">Técnico</span>}
              <p>{comment.message}</p>
              <small>{new Date(comment.createdAt).toLocaleString('es-CO')}</small>
            </div>
          ))}
          {!ticket.comments.length && <p>No hay comentarios todavía.</p>}
        </div>

        <form onSubmit={handleComment} className="form-grid bordered-top">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Escribe un comentario"
            required
          />
          {!user?.role || user.role !== 'TECHNICIAN' ? (
            error && <div className="alert error">{error}</div>
          ) : null}
          {!user?.role || user.role !== 'TECHNICIAN' ? (
            success && <div className="alert success">{success}</div>
          ) : null}
          <button type="submit">Agregar comentario</button>
        </form>
      </aside>
    </section>
  );
}
