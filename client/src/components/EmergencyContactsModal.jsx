import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Check, 
  Star, 
  MessageSquare, 
  Phone, 
  ShieldCheck, 
  Save, 
  RotateCcw,
  AlertTriangle 
} from 'lucide-react';

export const EmergencyContactsModal = () => {
  const {
    isContactsModalOpen,
    setIsContactsModalOpen,
    emergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    setPrimaryEmergencyContact,
    openWhatsAppWeb,
    setIsWhatsAppWizardOpen
  } = useEmergency();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Add Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '+91',
    relation: 'Family',
    isPrimary: false
  });
  
  // Edit Contact Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    relation: 'Family',
    isPrimary: false
  });

  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');
  const [justDispatchedId, setJustDispatchedId] = useState(null);

  if (!isContactsModalOpen) return null;

  // Add Contact Handler
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please provide a contact name.');
      return;
    }
    const cleanDigits = formData.phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 8) {
      setError('Please enter a valid phone number with country code (e.g. +91 98765 43210).');
      return;
    }

    addEmergencyContact(formData);
    setFormData({
      name: '',
      phone: '+91',
      relation: 'Family',
      isPrimary: false
    });
    setError('');
    setIsAdding(false);
  };

  // Start Editing Contact
  const handleStartEdit = (contact) => {
    setEditingId(contact.id);
    setEditFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation || 'Family',
      isPrimary: Boolean(contact.isPrimary)
    });
    setEditError('');
  };

  // Save Edited Contact
  const handleSaveEdit = (contactId) => {
    if (!editFormData.name.trim()) {
      setEditError('Contact name cannot be empty.');
      return;
    }
    const cleanDigits = editFormData.phone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 8) {
      setEditError('Please enter a valid phone number with country code.');
      return;
    }

    updateEmergencyContact(contactId, editFormData);
    setEditingId(null);
    setEditError('');
  };

  // Quick WhatsApp Dispatch
  const handleQuickWhatsApp = (contact) => {
    setJustDispatchedId(contact.id);
    openWhatsAppWeb(contact.phone);
    setTimeout(() => setJustDispatchedId(null), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9300,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-modal"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '92vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
            }}>
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Emergency Contacts
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Add, edit & dispatch live GPS location via WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsContactsModalOpen(false)}
            className="touch-target"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Top Quick Action: WhatsApp Web Wizard shortcut */}
          <div style={{
            padding: '14px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.25) 100%)',
            border: '1px solid rgba(37, 211, 102, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#25D366', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} />
                WhatsApp Web SOS Wizard
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Send live Google Maps location pin to your contacts
              </div>
            </div>
            <button
              onClick={() => {
                setIsContactsModalOpen(false);
                setIsWhatsAppWizardOpen(true);
              }}
              className="touch-target"
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#25D366',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Open Wizard
            </button>
          </div>

          {/* Add Contact Form (Toggleable) */}
          {isAdding ? (
            <form 
              onSubmit={handleAddSubmit}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Add New Emergency Contact
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--color-emergency)',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Papa / Dr. Sharma / Ankit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    marginTop: '4px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="+916360014779"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      marginTop: '4px',
                      borderRadius: '8px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Relationship
                  </label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 8px',
                      marginTop: '4px',
                      borderRadius: '8px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '12px'
                    }}
                  >
                    <option value="Family">Family</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Doctor / Hospital">Doctor / Hospital</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Colleague">Colleague</option>
                  </select>
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '4px'
              }}>
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-emergency)' }}
                />
                <span>Set as <strong>Primary Emergency Contact</strong></span>
              </label>

              <button
                type="submit"
                className="touch-target"
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '4px'
                }}
              >
                <Check size={16} />
                Save Emergency Contact
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="touch-target"
              style={{
                padding: '12px',
                borderRadius: '14px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                color: 'var(--color-info)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <UserPlus size={18} />
              Add Another Emergency Contact
            </button>
          )}

          {/* Contact List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Saved Trusted Contacts ({emergencyContacts.length})
            </span>

            {emergencyContacts.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                No emergency contacts saved yet. Click above to add your first contact.
              </div>
            ) : (
              emergencyContacts.map((contact) => {
                const isEditingThis = editingId === contact.id;

                if (isEditingThis) {
                  // INLINE EDIT FORM
                  return (
                    <div
                      key={contact.id}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'var(--bg-card-hover)',
                        border: '2px solid var(--color-info)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-info)' }}>
                          Editing: {contact.name}
                        </span>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {editError && (
                        <div style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: 'var(--color-emergency)',
                          fontSize: '11px'
                        }}>
                          {editError}
                        </div>
                      )}

                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          Name
                        </label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            marginTop: '2px',
                            borderRadius: '8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '13px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Phone / WhatsApp
                          </label>
                          <input
                            type="text"
                            value={editFormData.phone}
                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              marginTop: '2px',
                              borderRadius: '8px',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '13px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            Relationship
                          </label>
                          <select
                            value={editFormData.relation}
                            onChange={(e) => setEditFormData({ ...editFormData, relation: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '8px 6px',
                              marginTop: '2px',
                              borderRadius: '8px',
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '12px'
                            }}
                          >
                            <option value="Family">Family</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Doctor / Hospital">Doctor / Hospital</option>
                            <option value="Close Friend">Close Friend</option>
                            <option value="Colleague">Colleague</option>
                          </select>
                        </div>
                      </div>

                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={editFormData.isPrimary}
                          onChange={(e) => setEditFormData({ ...editFormData, isPrimary: e.target.checked })}
                          style={{ accentColor: 'var(--color-emergency)' }}
                        />
                        <span>Set as Primary Contact</span>
                      </label>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          onClick={() => handleSaveEdit(contact.id)}
                          className="touch-target"
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'var(--color-info)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Save size={14} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="touch-target"
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                // NORMAL DISPLAY CARD
                return (
                  <div
                    key={contact.id}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'var(--bg-card)',
                      border: contact.isPrimary ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {contact.name}
                          </span>
                          {contact.isPrimary && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '20px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: 'var(--color-emergency)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <Star size={10} fill="currentColor" />
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                          <span style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-card-hover)',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {contact.relation}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {contact.phone}
                          </span>
                        </div>
                      </div>

                      {/* Action Icons: Edit & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => handleStartEdit(contact)}
                          title="Edit Contact"
                          className="touch-target"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            color: 'var(--color-info)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => deleteEmergencyContact(contact.id)}
                          title="Delete Contact"
                          className="touch-target"
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: 'var(--color-emergency)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Actions for this contact */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Send WhatsApp Live Location SOS */}
                      <button
                        onClick={() => handleQuickWhatsApp(contact)}
                        className="touch-target"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: '#25D366',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        <MessageSquare size={15} />
                        {justDispatchedId === contact.id ? 'Opening WhatsApp...' : 'Send WhatsApp SOS'}
                      </button>

                      {/* Set Primary Button */}
                      {!contact.isPrimary && (
                        <button
                          onClick={() => setPrimaryEmergencyContact(contact.id)}
                          className="touch-target"
                          style={{
                            padding: '8px 10px',
                            borderRadius: '10px',
                            background: 'var(--bg-card-hover)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Star size={13} />
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
            Contacts saved to local device
          </span>
          <button
            onClick={() => setIsContactsModalOpen(false)}
            className="touch-target"
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
