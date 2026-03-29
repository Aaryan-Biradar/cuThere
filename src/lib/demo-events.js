const TODAY_DATE = new Date().toISOString().slice(0, 10);

export const TEST_EVENT = {
  id: 'test-event-001',
  title: 'CCSS Networking Night',
  description:
    'Come to a night of networking and fun with alumni, recruiters, and student leaders.',
  date: TODAY_DATE,
  time: '6:00 PM',
  location: 'UC Atrium',
  image_url: '',
  tags: ['Social', 'Career'],
  category: 'Career',
  isMock: true,
};

export const TODAY_EVENT_TWO = {
  id: 'test-event-002',
  title: 'Quad Coffee Chat',
  description: 'Drop by for coffee, meet new students, and discover clubs around campus.',
  date: TODAY_DATE,
  time: '2:00 PM',
  location: 'Carleton Quad',
  image_url: '',
  tags: ['Social', 'Wellness'],
  category: 'Social',
  isMock: true,
};

export const LOCAL_FALLBACK_EVENTS = [
  TEST_EVENT,
  TODAY_EVENT_TWO,
  {
    id: 'local-2',
    title: 'Design Sprint Workshop',
    description:
      'A hands-on product design workshop where teams prototype and pitch in one evening.',
    date: '2026-11-03',
    time: '5:30 PM',
    location: 'MacOdrum Library Innovation Lab',
    image_url: '',
    tags: ['Workshop', 'Academic'],
    category: 'Workshop',
    isMock: true,
  },
  {
    id: 'local-3',
    title: 'Athletics Open House',
    description: 'Try campus sports clubs, meet team captains, and sign up for intramural leagues.',
    date: '2026-09-18',
    time: '4:00 PM',
    location: 'Ravens Nest',
    image_url: '',
    tags: ['Sports', 'Social'],
    category: 'Sports',
    isMock: true,
  },
  {
    id: 'local-4',
    title: 'Data Science Mixer',
    description:
      'Meet students and faculty working on AI, data science, and product analytics.',
    date: '2026-10-21',
    time: '7:00 PM',
    location: 'Nicol Building Lobby',
    image_url: '',
    tags: ['Academic', 'Career', 'Tech'],
    category: 'Tech',
    isMock: true,
  },
  {
    id: 'local-5',
    title: 'Campus Trivia Night',
    description: 'A fun social evening with team trivia, snacks, and prizes for top groups.',
    date: '2026-10-23',
    time: '8:00 PM',
    location: 'Residence Commons',
    image_url: '',
    tags: ['Social'],
    category: 'Social',
    isMock: true,
  },
];

/**
 * Lookup a demo/mock event by id (string or number). Used when DB has no row.
 */
export function getDemoEventById(id) {
  if (id == null || id === '') return null;
  const sid = String(id);
  return LOCAL_FALLBACK_EVENTS.find((e) => String(e.id) === sid) ?? null;
}
