// These atelier categories have dedicated staff/time rules in the backend.
export const atelierBookingRules: Record<string, {technician: string; slots: string[]}> = {
  ATELIER_KANG_CUSTOM: {technician: 'Master Min-Seok Kang', slots: ['14:00','16:30']},
  ATELIER_KANG_RESIZING: {technician: 'Master Min-Seok Kang', slots: ['14:00','16:30']},
  ATELIER_AURUM_GEMOLOGY: {technician: 'Dr. David C. Vance', slots: ['10:00','14:00','17:00']},
  ATELIER_AURUM_ASSAY: {technician: 'Dr. David C. Vance', slots: ['10:00','14:00','17:00']},
  ATELIER_MILANO_RESTORATION: {technician: 'Maestro Marco Bellini', slots: ['11:00','14:00','17:00']},
  ATELIER_MILANO_POLISHING: {technician: 'Maestro Marco Bellini', slots: ['11:00','14:00','17:00']},
};
