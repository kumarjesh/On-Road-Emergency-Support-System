import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  X, 
  MessageSquare, 
  MapPin, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  ShieldAlert, 
  Navigation, 
  Sparkles, 
  Users, 
  Smartphone, 
  Globe,
  RefreshCw
} from 'lucide-react';

export const WhatsAppWizardModal = () => {
  const {
    isWhatsAppWizardOpen,
    setIsWhatsAppWizardOpen,
    coords,
    activeEmergency,
    userProfile,
    emergencyContacts,
    openWhatsAppWeb,
    openWhatsAppMobile,
    generateWhatsAppMessage,
    fetchCoordinates,
    isLocating,
    setIsLocationPickerOpen
  } = useEmergency();

  const [customNote, setCustomNote] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'direct' | 'preview'
  const [dispatchedContactId, setDispatchedContactId] = useState(null);

  if (!isWhatsAppWizardOpen) return null;

  const lat = activeEmergency?.userLocation?.lat ?? coords.lat;
  const lng = activeEmergency?.userLocation?.lng ?? coords.lng;
  const locationName = activeEmergency?.address ?? coords.addressHint ?? 'Live GPS Location';
  const mapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  const trackingUrl = `${window.location.origin}/?track=${activeEmergency?.id || 'live'}`;

  // Formatted WhatsApp text
  const currentMessage = generateWhatsAppMessage(activeEmergency) + 
    (customNote ? `\n\n📝 *Additional Note:* ${customNote}` : '');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSendToContact = (contact, mode = 'web') => {
    setDispatchedContactId(contact.id);
    if (mode === 'web') {
      openWhatsAppWeb(contact.phone, currentMessage);
    } else {
      openWhatsAppMobile(contact.phone, currentMessage);
    }
    setTimeout(() => setDispatchedContactId(null), 3500);
  };

  const handleSendDirect = (mode = 'web') => {
    const cleanDigits = directPhone.replace(/[^0-9]/g, '');
    if (!cleanDigits) return;
    if (mode === 'web') {
      openWhatsAppWeb(directPhone, currentMessage);
    } else {
      openWhatsAppMobile(directPhone, currentMessage);
    }
  };

  // Broadcast to all saved contacts
  const handleBroadcastAll = () => {
    emergencyContacts.forEach((contact, idx) => {
      setTimeout(() => {
        openWhatsAppWeb(contact.phone, currentMessage);
      }, idx * 1200);
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9400,
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-modal"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(37, 211, 102, 0.35)'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-glass)',
          background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.25) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: '#25D366',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(37, 211, 102, 0.5)'
            }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  WhatsApp Web SOS Wizard
                </h3>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#25D366',
                  color: '#000'
                }}>
                  VERIFIED
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Send live GPS location directly via web.whatsapp.com
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsWhatsAppWizardOpen(false)}
            className="touch-target"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
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

        {/* Live GPS Telemetry Pill */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              GPS: {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ({locationName})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={fetchCoordinates}
              disabled={isLocating}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-warning)',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Refresh device GPS or ISP geolocation"
            >
              <RefreshCw size={12} />
              {isLocating ? 'Locating...' : 'Refresh GPS'}
            </button>

            <a
              href={mapsPinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
              title="Verify pin on Google Maps"
            >
              <MapPin size={13} />
              Verify Google Maps Pin
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          padding: '8px 20px 0',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveTab('contacts')}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'contacts' ? '2px solid #25D366' : '2px solid transparent',
              color: activeTab === 'contacts' ? '#25D366' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} />
            Saved Contacts ({emergencyContacts.length})
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'preview' ? '2px solid #25D366' : '2px solid transparent',
              color: activeTab === 'preview' ? '#25D366' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={14} />
            Message Preview
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            style={{
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'direct' ? '2px solid #25D366' : '2px solid transparent',
              color: activeTab === 'direct' ? '#25D366' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} />
            Custom Number
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {activeTab === 'contacts' && (
            <>
              {/* Broadcast Header */}
              {emergencyContacts.length > 1 && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-emergency)' }}>
                      Multi-Contact Emergency Broadcast
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Send to all {emergencyContacts.length} contacts automatically
                    </div>
                  </div>
                  <button
                    onClick={handleBroadcastAll}
                    className="touch-target"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--color-emergency)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Broadcast to All
                  </button>
                </div>
              )}

              {/* Contacts Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      padding: '14px',
                      borderRadius: '16px',
                      background: 'var(--bg-card)',
                      border: contact.isPrimary ? '1px solid rgba(37, 211, 102, 0.5)' : '1px solid var(--border-glass)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                              background: 'rgba(37, 211, 102, 0.2)',
                              color: '#25D366'
                            }}>
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {contact.relation} • <strong>{contact.phone}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons: WhatsApp Web vs Mobile App */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                      <button
                        onClick={() => handleSendToContact(contact, 'web')}
                        className="touch-target"
                        style={{
                          padding: '10px',
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
                          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                        }}
                      >
                        <Globe size={15} />
                        {dispatchedContactId === contact.id ? 'Opening WhatsApp Web...' : 'Open WhatsApp Web'}
                      </button>

                      <button
                        onClick={() => handleSendToContact(contact, 'mobile')}
                        className="touch-target"
                        style={{
                          padding: '10px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        title="Open in WhatsApp Desktop or Mobile App"
                      >
                        <Smartphone size={14} />
                        wa.me Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                This is the exact distress alert that will be delivered via WhatsApp with your live coordinates and radar tracker:
              </div>

              {/* WhatsApp Chat Bubble Mockup */}
              <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {currentMessage}
              </div>

              {/* Optional Custom Note */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Add a Custom Quick Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engine smoke, highway exit 4, flat tyre"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    marginTop: '4px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* 1-Tap Copy Button */}
              <button
                onClick={handleCopy}
                className="touch-target"
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: copied ? 'var(--color-success)' : 'var(--bg-card)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Message to Clipboard'}
              </button>
            </div>
          )}

          {activeTab === 'direct' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Want to send to a contact not saved in your emergency list? Enter any WhatsApp number below:
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    marginTop: '6px',
                    borderRadius: '10px',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '6px' }}>
                <button
                  onClick={() => handleSendDirect('web')}
                  disabled={!directPhone.trim()}
                  className="touch-target"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#25D366',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    border: 'none',
                    cursor: directPhone.trim() ? 'pointer' : 'not-allowed',
                    opacity: directPhone.trim() ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={16} />
                  Open in WhatsApp Web
                </button>

                <button
                  onClick={() => handleSendDirect('mobile')}
                  disabled={!directPhone.trim()}
                  className="touch-target"
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: directPhone.trim() ? 'pointer' : 'not-allowed',
                    opacity: directPhone.trim() ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Smartphone size={16} />
                  wa.me Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Opens directly in web.whatsapp.com
          </span>
          <button
            onClick={() => setIsWhatsAppWizardOpen(false)}
            className="touch-target"
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
