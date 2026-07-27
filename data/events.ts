export type EventPresence = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate?: string;
  schedule?: string;
  description?: string;
  mapUrl?: string;
  allowsPickup?: boolean;
  isPublished: boolean;
};

export const eventPresences: EventPresence[] = [];

const today = new Date();
today.setHours(0, 0, 0, 0);

export const upcomingEventPresences = eventPresences
  .filter((event) => event.isPublished && new Date(event.endDate ?? event.startDate) >= today)
  .sort((first, second) => new Date(first.startDate).getTime() - new Date(second.startDate).getTime());
