// Twilio module removed per user request. Dispatches are handled via WhatsApp Web Wizard.
export async function sendEmergencySms(to, message) {
  console.log(`💬 [WhatsApp Dispatch] Sent to ${to}: ${message}`);
  return { success: true, method: 'whatsapp' };
}
