import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  MessageSquare, 
  Send, 
  ExternalLink, 
  MapPin, 
  Globe, 
  Users 
} from 'lucide-react';

export const ShareModal = ({ isOpen, onClose, activeEmergency }) => {
  const { 
    setIsWhatsAppWizardOpen, 
    setIsContactsModalOpen, 
    emergencyContacts, 
    openWhatsAppWeb 
  } = useEmergency();
  
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeEmergency) return null;

  const lat = activeEmergency.userLocation?.lat;
  const lng = activeEmergency.userLocation?.lng;
  const trackingUrl = `${window.location.origin}/?track=${activeEmergency.id}`;
  const mapsPinUrl = `https://www.google.com/maps/search/?api=1&query=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
  const shareMessage = `🚨 ResQRoad Emergency Alert: Assistance requested for ${activeEmergency.emergencyType} at ${activeEmergency.address}. GPS: ${mapsPinUrl}. Track live rescue: ${trackingUrl}`;

  // Copy to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // WhatsApp Web direct
  const handleOpenWizard = () => {
    onClose();
    setIsWhatsAppWizardOpen(true);
  };

  // Device SMS
  const handleSms = () => {
    window.location.href = `sms:?&body=${encodeURIComponent(shareMessage)}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9200,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div 
        className="glass-modal"
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '24px',
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
          borderBottom: '1px solid var(--border-glass)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 211, 102, 0.15)',
              color: '#25D366',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                Share Live Location
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Keep family, friends, and doctors informed in real time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Body */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Tracking Link Box */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '12px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              Live Tracking Link
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-card-hover)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1
              }}>
                {trackingUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="touch-target"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: copied ? 'var(--color-success)' : 'var(--color-info)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Quick Share Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {/* WhatsApp Web Wizard Button */}
            <button
              onClick={handleOpenWizard}
              className="touch-target"
              style={{
                padding: '14px 12px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(18, 140, 126, 0.3) 100%)',
                border: '1px solid rgba(37, 211, 102, 0.5)',
                color: '#25D366',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <MessageSquare size={22} />
              <span>WhatsApp Web SOS</span>
            </button>

            {/* Device SMS */}
            <button
              onClick={handleSms}
              className="touch-target"
              style={{
                padding: '14px 12px',
                borderRadius: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Send size={22} style={{ color: 'var(--color-info)' }} />
              <span>Standard SMS</span>
            </button>
          </div>

          {/* WhatsApp Web Emergency Wizard Card */}
          <div style={{
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#25D366', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} />
                WHATSAPP WEB EMERGENCY WIZARD
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsContactsModalOpen(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Users size={12} />
                Contacts ({emergencyContacts.length})
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Dispatches your <strong>exact Google Maps pin</strong> and real-time tracking radar via web.whatsapp.com to your emergency contacts.
            </p>

            <button
              onClick={handleOpenWizard}
              className="touch-target"
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#25D366',
                color: '#fff',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
              }}
            >
              <MessageSquare size={16} />
              Open WhatsApp Web Wizard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
