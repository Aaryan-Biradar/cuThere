/** Client-side demo events for EventCard / event page UI checks. Does not touch the DB or API routes. */

export const UI_TEST_EVENT_ID = '__ui_test_event__';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function todayLocalISODate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysISO(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Unsplash CDN: fixed aspect via w/h + fit=crop (source is cropped to these ratios). */
function unsplashSquare(photoPath) {
  return `https://images.unsplash.com/${photoPath}?w=800&h=800&fit=crop&q=85`;
}
function unsplash45(photoPath) {
  return `https://images.unsplash.com/${photoPath}?w=800&h=1000&fit=crop&q=85`;
}

function buildEvents() {
  const t = todayLocalISODate();
  return [
    {
      id: '__ui_test_event__',
      title: 'UI test — Event card preview (today)',
      description:
        'Temporary demo for layout only. Not stored in your database. Remove ui-test-event usage when done.',
      date: t,
      event_date: t,
      time: '4:00 PM',
      location: 'Ravens Nest, Carleton University',
      displayUrl: unsplashSquare('photo-1523580846011-d3a5bc25702b'),
      tags: ['Social'],
      hosts: ['cuThere (demo)'],
      category: 'Social',
    },
    {
      id: '__ui_test_event__2',
      title: 'Winter hack night',
      description: 'Demo event — bring your laptop.',
      date: addDaysISO(1),
      event_date: addDaysISO(1),
      time: '6:30 PM',
      location: 'HP 5345',
      displayUrl: unsplash45('photo-1517245386807-bb43f82c33c4'),
      tags: ['Tech & Software'],
      hosts: ['CSS'],
      category: 'Tech & Software',
    },
    {
      id: '__ui_test_event__3',
      title: 'Career fair drop-in',
      description: 'Demo — meet employers at tables.',
      date: addDaysISO(3),
      event_date: addDaysISO(3),
      time: '11:00 AM',
      location: 'Fieldhouse',
      displayUrl: unsplashSquare('photo-1540575467063-178a50c2df87'),
      tags: ['Career & Networking'],
      hosts: ['Career Services'],
      category: 'Career & Networking',
    },
    {
      id: '__ui_test_event__4',
      title: 'Study session — calculus',
      description: 'Demo peer tutoring block.',
      date: addDaysISO(5),
      event_date: addDaysISO(5),
      time: '7:00 PM',
      location: 'MacOdrum Library',
      displayUrl: unsplash45('photo-1504384308090-c894fdcc538d'),
      tags: ['Academic'],
      hosts: ['Math Society'],
      category: 'Academic',
    },
    {
      id: '__ui_test_event__5',
      title: 'Board games & pizza',
      description: 'Demo social — free slices while they last.',
      date: addDaysISO(7),
      event_date: addDaysISO(7),
      time: '5:00 PM',
      location: 'University Centre',
      displayUrl: unsplashSquare('photo-1475721027785-f74eccf877e2'),
      tags: ['Social', 'Free Food'],
      hosts: ['CUSG'],
      category: 'Social',
    },
    {
      id: '__ui_test_event__6',
      title: 'Jazz in the quad',
      description: 'Demo outdoor performance (weather permitting).',
      date: addDaysISO(10),
      event_date: addDaysISO(10),
      time: '3:00 PM',
      location: 'Quad',
      displayUrl: unsplash45('photo-1492684223066-81342ee5ff30'),
      tags: ['Arts & Culture'],
      hosts: ['Music Club'],
      category: 'Arts & Culture',
    },
    {
      id: '__ui_test_event__7',
      title: 'Intramural volleyball signup',
      description: 'Demo signup block for spring league.',
      date: addDaysISO(2),
      event_date: addDaysISO(2),
      time: '12:00 PM',
      location: 'Gymnasium',
      displayUrl: unsplashSquare('photo-1523240795612-9a054b0db644'),
      tags: ['Sports'],
      hosts: ['Athletics'],
      category: 'Sports',
    },
    {
      id: '__ui_test_event__8',
      title: 'Campus photo walk',
      description: 'Demo — golden hour shots by the canal.',
      date: addDaysISO(4),
      event_date: addDaysISO(4),
      time: '5:30 PM',
      location: 'Canal building steps',
      displayUrl: unsplash45('photo-1506905925346-21bda4d32df4'),
      tags: ['Arts & Culture'],
      hosts: ['Photo Club'],
      category: 'Arts & Culture',
    },
    {
      id: '__ui_test_event__9',
      title: 'Mindfulness drop-in',
      description: 'Demo guided breathing — mats provided.',
      date: addDaysISO(6),
      event_date: addDaysISO(6),
      time: '8:00 AM',
      location: 'Wellness Centre',
      displayUrl: unsplashSquare('photo-1544367567-0f2fcb009e0b'),
      tags: ['Health & Wellness'],
      hosts: ['Health Promotion'],
      category: 'Health & Wellness',
    },
    {
      id: '__ui_test_event__10',
      title: 'Git & GitHub basics',
      description: 'Demo workshop — laptops welcome.',
      date: addDaysISO(2),
      event_date: addDaysISO(2),
      time: '2:00 PM',
      location: 'HP 4112',
      displayUrl: unsplash45('photo-1517694712202-14dd9538aa97'),
      tags: ['Tech & Software'],
      hosts: ['IEEE Carleton'],
      category: 'Tech & Software',
    },
    {
      id: '__ui_test_event__11',
      title: 'Outdoor movie night',
      description: 'Demo screening — bring a blanket.',
      date: addDaysISO(7),
      event_date: addDaysISO(7),
      time: '8:45 PM',
      location: 'Ravens’ Field',
      displayUrl: unsplashSquare('photo-1489599849927-2ee91cedd3d0'),
      tags: ['Social', 'Arts & Culture'],
      hosts: ['CUSG'],
      category: 'Social',
    },
  ];
}

export function getUiTestEvents() {
  return buildEvents();
}

/** @deprecated Use getUiTestEvents()[0] or getUiTestEventById */
export function getUiTestEvent() {
  return getUiTestEvents()[0];
}

export function getUiTestEventById(id) {
  if (id == null || id === '') return null;
  return getUiTestEvents().find((e) => String(e.id) === String(id)) ?? null;
}

export function isUiTestEventId(id) {
  return getUiTestEventById(id) != null;
}
