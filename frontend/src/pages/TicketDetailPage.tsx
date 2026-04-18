import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Category { id: number; name: string; }
interface UserInfo { id: number; name: string; email: string; role?: 'USER' | 'TECHNICIAN'; }
interface CommentItem { id: number; message: string; createdAt: string; user: UserInfo; }

interface TicketDetail {
  id: number; title: string; description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  creator: UserInfo; technician?: UserInfo | null;
  category: Category; comments: CommentItem[];
}

const STATUS_LABEL = { OPEN: 'Abierto', IN_PROGRESS: 'En proceso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado' };
const STATUS_CLASS = { OPEN: 'badge-open', IN_PROGRESS: 'badge-progress', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' };
const PRIORITY_LABEL = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' };

function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export function TicketDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<TicketDetail['status']>('OPEN');
  const [priority, setPriority] = useState<TicketDetail['priority']>('MEDIUM');
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => { loadTicket(); }, [loadTicket]);

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    setCommentError(''); setCommentSuccess(''); setSubmitting(true);
    try {
      await apiFetch(`/tickets/${id}/comments`, { method: 'POST', token, body: JSON.stringify({ message }) });
      setMessage('');
      setCommentSuccess('Comentario agregado');
      await loadTicket();
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'No se pudo guardar el comentario');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    setError(''); setUpdateSuccess(''); setUpdating(true);
    try {
      await apiFetch(`/tickets/${id}`, { method: 'PATCH', token, body: JSON.stringify({ status, priority }) });
      setUpdateSuccess('Ticket actualizado');
      await loadTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el ticket');
    } finally {
      setUpdating(false);
    }
  }

  if (!ticket && !error) {
    return <div className="centered"><div className="spinner"></div>Cargando ticket...</div>;
  }

  if (error && !ticket) {
    return <div className="centered" style={{ flexDirection: 'column', gap: '12px' }}>
      <p style={{ color: '#DC2626' }}>{error}</p>
      <Link to="/" className="btn btn-secondary">← Volver al dashboard</Link>
    </div>;
  }

  if (!ticket) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Link to="/" style={{ color: '#6B7280', fontSize: '13px' }}>Dashboard</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Ticket #{ticket.id}</span>
          </div>
          <h2 style={{ maxWidth: '500px' }}>{ticket.title}</h2>
        </div>
        <Link to="/" className="btn btn-secondary btn-sm">← Volver</Link>
      </div>

      <div className="detail-grid">
        {/* Left col: info + update */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card">
            <div className="card-header">
              <h3>Detalles del ticket</h3>
              <span className={`badge ${STATUS_CLASS[ticket.status]}`}>{STATUS_LABEL[ticket.status]}</span>
            </div>
            <div className="card-body">
              <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>{ticket.description}</p>

              <div className="detail-meta">
                <div className="meta-item">
                  <span className="meta-key">ID</span>
                  <span className="meta-val" style={{ fontFamily: 'monospace', color: '#9CA3AF' }}>#{ticket.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-key">Prioridad</span>
                  <span className="meta-val">
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>{PRIORITY_LABEL[ticket.priority]}</span>
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-key">Categoría</span>
                  <span className="meta-val">{ticket.category.name}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-key">Fecha</span>
                  <span className="meta-val">{new Date(ticket.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-key">Solicitante</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <div className="mini-avatar">{initials(ticket.creator.name)}</div>
                    <span className="meta-val">{ticket.creator.name}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-key">Técnico asignado</span>
                  {ticket.technician ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <div className="mini-avatar" style={{ background: '#F5F3FF', color: '#5B21B6' }}>{initials(ticket.technician.name)}</div>
                      <span className="meta-val">{ticket.technician.name}</span>
                    </div>
                  ) : (
                    <span className="meta-val" style={{ color: '#9CA3AF' }}>Sin asignar</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {user?.role === 'TECHNICIAN' && (
            <div className="card">
              <div className="card-header"><h3>Actualizar ticket</h3></div>
              <div className="card-body">
                <div className="update-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Estado</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as TicketDetail['status'])}>
                      <option value="OPEN">Abierto</option>
                      <option value="IN_PROGRESS">En proceso</option>
                      <option value="RESOLVED">Resuelto</option>
                      <option value="CLOSED">Cerrado</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Prioridad</label>
                    <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value as TicketDetail['priority'])}>
                      <option value="LOW">Baja</option>
                      <option value="MEDIUM">Media</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  </div>
                </div>
                {error && <div className="alert alert-error" style={{ marginTop: '10px', marginBottom: '10px' }}>{error}</div>}
                {updateSuccess && <div className="alert alert-success" style={{ marginTop: '10px', marginBottom: '10px' }}>✓ {updateSuccess}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                    {updating ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right col: comments */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h3>Comentarios</h3>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{ticket.comments.length} mensajes</span>
          </div>
          <div className="card-body">
            <div className="comments-list">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className={`comment-item ${comment.user.role === 'TECHNICIAN' ? 'comment-tech' : ''}`}>
                  <div className="comment-header">
                    <div className="mini-avatar" style={comment.user.role === 'TECHNICIAN' ? { background: '#F5F3FF', color: '#5B21B6' } : {}}>
                      {initials(comment.user.name)}
                    </div>
                    <span className="comment-name">{comment.user.name}</span>
                    {comment.user.role === 'TECHNICIAN' && (
                      <span className="badge badge-tech" style={{ fontSize: '10px' }}>Técnico</span>
                    )}
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="comment-text">{comment.message}</p>
                </div>
              ))}
              {!ticket.comments.length && (
                <div className="no-comments">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  Sin comentarios todavía
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '14px' }}>
              <form onSubmit={handleComment}>
                <div className="form-group">
                  <label className="form-label">Agregar comentario</label>
                  <textarea
                    className="form-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Escribe una respuesta o actualización..."
                    required
                  />
                </div>
                {commentError && <div className="alert alert-error" style={{ marginBottom: '10px' }}>{commentError}</div>}
                {commentSuccess && <div className="alert alert-success" style={{ marginBottom: '10px' }}>✓ {commentSuccess}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Comentar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
