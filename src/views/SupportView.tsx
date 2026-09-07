import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportTicket } from '../types';
import {
  Plus,
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Send,
  Upload,
  Search,
  Filter,
  Paperclip,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const { supportTickets, addSupportTicket, currentUser, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Form State
  const [ticketType, setTicketType] = useState<SupportTicket['type']>('Bug');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [attachedFileNames, setAttachedFileNames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal Reply State
  const [replyText, setReplyText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(f => f.name);
      setAttachedFileNames(files.slice(0, 5));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      showToast('Please fill out both title and details');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      addSupportTicket({
        type: ticketType,
        title: title.trim(),
        details: details.trim(),
        attachments: attachedFileNames,
        submittedBy: currentUser?.username || 'lifecare_admin',
        replies: [
          {
            id: `rep-${Date.now()}`,
            author: currentUser?.name || 'lifecare_admin',
            isStaff: false,
            message: details.trim(),
            createdAt: 'Just now'
          }
        ]
      });

      // Reset form & return to list
      setTitle('');
      setDetails('');
      setAttachedFileNames([]);
      setIsSubmitting(false);
      setViewMode('list');
    }, 400);
  };

  const handleSendReply = (ticketId: string) => {
    if (!replyText.trim() || !selectedTicket) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      author: currentUser?.name || 'lifecare_admin',
      isStaff: false,
      message: replyText.trim(),
      createdAt: 'Just now'
    };

    const updated = {
      ...selectedTicket,
      replies: [...(selectedTicket.replies || []), newReply],
      updatedAt: 'Just now'
    };

    setSelectedTicket(updated);
    setReplyText('');
    showToast('Reply added to issue thread');
  };

  const filteredTickets = supportTickets.filter(t => {
    const matchesSearch =
      t.ticketNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadgeStyle = (type: SupportTicket['type']) => {
    switch (type) {
      case 'Bug':
        return { background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3' };
      case 'Improvement':
        return { background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' };
      case 'Feedback':
        return { background: '#f3e8ff', color: '#9333ea', border: '1px solid #e9d5ff' };
      case 'Issue':
      default:
        return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
    }
  };

  const getStatusBadgeStyle = (status: SupportTicket['status']) => {
    switch (status) {
      case 'Resolved':
        return { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' };
      case 'In Progress':
        return { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' };
      case 'Under Review':
        return { background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7' };
      case 'Open':
      default:
        return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
    }
  };

  return (
    <div className="view-container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* ====================================================================
          MODE 1: TICKET LIST VIEW
          ==================================================================== */}
      {viewMode === 'list' && (
        <>
          {/* Header Row */}
          <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Support & Issues
              </h1>
              <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                Report bugs, request improvements, or send feedback. We'll reply by email.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setViewMode('create')}
              style={{
                background: '#0f172a',
                color: '#fff',
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Report an issue
            </button>
          </div>

          {/* Search & Filter Bar (shown if there are tickets) */}
          {supportTickets.length > 0 && (
            <div
              className="card"
              style={{
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search by title, details or #ISS number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '34px', fontSize: '13px', height: '38px', borderRadius: '7px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', fontSize: '13px', height: '38px', borderRadius: '7px' }}
                >
                  <option value="ALL">All Types</option>
                  <option value="Bug">Bug</option>
                  <option value="Improvement">Improvement</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Issue">Issue</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', fontSize: '13px', height: '38px', borderRadius: '7px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          )}

          {/* Ticket List Container */}
          {filteredTickets.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#64748b'
                }}
              >
                <MessageSquare size={22} />
              </div>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {supportTickets.length === 0 ? (
                  <>
                    No issues yet. Click <strong>Report an issue</strong> to get started.
                  </>
                ) : (
                  'No issues match your current filters.'
                )}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="card"
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px' }}>
                        #{ticket.ticketNo}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          ...getTypeBadgeStyle(ticket.type)
                        }}
                      >
                        {ticket.type}
                      </span>

                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '12px',
                          ...getStatusBadgeStyle(ticket.status)
                        }}
                      >
                        ● {ticket.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} /> {ticket.createdAt}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {ticket.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    {ticket.details.length > 180 ? `${ticket.details.slice(0, 180)}…` : ticket.details}
                  </p>

                  {/* Latest Update Box */}
                  {ticket.latestUpdate && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderLeft: '3px solid #10b9b3',
                        padding: '10px 14px',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '12px',
                        color: '#334155',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#0f766e', marginRight: '6px' }}>Support Team Update:</strong>
                        <span>{ticket.latestUpdate}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{ticket.updatedAt}</span>
                    </div>
                  )}

                  {/* Card Bottom Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f8fafc' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Submitted by: <strong>@{ticket.submittedBy}</strong></span>
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                          <Paperclip size={12} /> {ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      View thread & updates <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ====================================================================
          MODE 2: TICKET SUBMISSION FORM (MATCHING LIVE /support/new)
          ==================================================================== */}
      {viewMode === 'create' && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '13px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#334155',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Report an issue
            </h1>
            <p className="page-subtitle" style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Bug, improvement, or feedback — we'll email you when we reply.
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Type *
                  </label>
                  <select
                    className="form-control"
                    value={ticketType}
                    onChange={e => setTicketType(e.target.value as SupportTicket['type'])}
                    style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Bug">Bug</option>
                    <option value="Improvement">Improvement</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Issue">Issue</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Short summary"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    style={{ height: '42px', borderRadius: '8px', fontSize: '14px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Details *
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Describe the issue, steps to reproduce, or your suggestion…"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  required
                  style={{ borderRadius: '8px', fontSize: '14px', padding: '12px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>
                  Attach images (optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  >
                    <Upload size={14} /> Choose files
                    <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {attachedFileNames.length > 0 ? attachedFileNames.join(', ') : 'No file chosen'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                  Up to 5 images, 10 MB each.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !details.trim()}
                  className="btn btn-primary"
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: 600,
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: !title.trim() || !details.trim() ? 'not-allowed' : 'pointer',
                    opacity: !title.trim() || !details.trim() ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={15} /> {isSubmitting ? 'Submitting...' : 'Submit issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          TICKET DETAILS MODAL (THREAD & STATUS UPDATES)
          ==================================================================== */}
      {selectedTicket && (
        <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '640px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                    #{selectedTicket.ticketNo}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      ...getStatusBadgeStyle(selectedTicket.status)
                    }}
                  >
                    ● {selectedTicket.status}
                  </span>
                </div>
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedTicket.title}
                </h3>
              </div>
              <button className="icon-btn" onClick={() => setSelectedTicket(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {/* Ticket Overview Info */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748b', fontSize: '12px' }}>
                  <span>Created by <strong>@{selectedTicket.submittedBy}</strong></span>
                  <span>{selectedTicket.createdAt}</span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{selectedTicket.details}</p>

                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ fontWeight: 600 }}>Attachments: </span>
                    {selectedTicket.attachments.join(', ')}
                  </div>
                )}
              </div>

              {/* Updates & Replies Timeline */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '12px', letterSpacing: '0.5px' }}>
                Conversation & Activity ({selectedTicket.replies?.length || 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                  selectedTicket.replies.map((reply, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: reply.isStaff ? '#f0fdfa' : '#ffffff',
                        border: reply.isStaff ? '1px solid #ccfbf1' : '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px', color: reply.isStaff ? '#0f766e' : '#0f172a' }}>
                          {reply.author} {reply.isStaff && <span style={{ fontSize: '10px', background: '#0d9488', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>Support Team</span>}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{reply.createdAt}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                        {reply.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No replies yet. Our support engineering desk will respond within 24 hours.
                  </div>
                )}
              </div>

              {/* Add Follow-Up Reply Input */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                  Send follow-up note to support:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type additional details or question..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendReply(selectedTicket.id);
                    }}
                    style={{ height: '40px', borderRadius: '7px', fontSize: '13px' }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendReply(selectedTicket.id)}
                    style={{ background: '#0f172a', padding: '0 16px', borderRadius: '7px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} /> Send
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
