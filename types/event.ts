export interface Attendee {
  name: string;
  email: string;
  phone?: string; // Optional phone number
}

export interface Event {
  id?: string;
  title: string;
  description?: string;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // Optional start time (e.g., "06:00" or "6:00")
  endTime?: string; // Optional end time (e.g., "18:00" or "6:00")
  time?: string; // Optional time (deprecated, kept for backward compatibility)
  location?: string;
  price: number;
  imageUrl?: string;
  createdAt?: unknown;
  attendees?: Attendee[]; // Array of attendee objects
}

