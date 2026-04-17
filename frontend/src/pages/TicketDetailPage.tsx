import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Category {
  id: number;
  name: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role?: 'USER' | 'TECHNICIAN';
}

interface CommentItem {
  id: number;
  message: string;
  createdAt: string;
  user: UserInfo;
}

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

export function TicketDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'>('OPEN');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadTicket() {
    try {
      const data = await apiFetch<TicketDetail>(`/tickets/${id}`, { token });
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el ticket');
    }
  }

  useEffect(() => {
    loadTicket();
  }, [id]);

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
    return <div className="centered">Cargando ticket...</div>;
  }

  return (
    <section className="grid detail-grid">
      <article className="card">
        <h2>{ticket.title}</h2>
        <p>{ticket.description}</p>
        <div className="meta-grid">
          <span><strong>ID:</strong> #{ticket.id}</span>
          <span><strong>Estado:</strong> {ticket.status}</span>
          <span><strong>Prioridad:</strong> {ticket.priority}</span>
          <span><strong>Categoría:</strong> {ticket.category.name}</span>
          <span><strong>Solicitante:</strong> {ticket.creator.name}</span>
        </div>

        {user?.role === 'TECHNICIAN' && (
          <div className="form-grid bordered-top">
            <h3>Actualizar ticket</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED')}>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <button type="button" onClick={handleUpdate}>Actualizar</button>
          </div>
        )}
      </article>

      <aside className="card">
        <h3>Comentarios</h3>
        <div className="comments-list">
          {ticket.comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <strong>{comment.user.name}</strong>
              <p>{comment.message}</p>
              <small>{new Date(comment.createdAt).toLocaleString()}</small>
            </div>
          ))}
          {!ticket.comments.length && <p>No hay comentarios todavía.</p>}
        </div>

        <form onSubmit={handleComment} className="form-grid bordered-top">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Escribe un comentario" required />
          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}
          <button type="submit">Agregar comentario</button>
        </form>
      </aside>
    </section>
  );
}
