import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'calendar.json');

const getRealWorldDayNum = (offsetDaysFromMonday) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday + offsetDaysFromMonday);
  return monday.getDate().toString().padStart(2, '0');
};

const getDefaultEvents = () => {
  const mon = getRealWorldDayNum(0);
  const tue = getRealWorldDayNum(1);
  const wed = getRealWorldDayNum(2);
  const thu = getRealWorldDayNum(3);
  const fri = getRealWorldDayNum(4);
  const sat = getRealWorldDayNum(5);
  const sun = getRealWorldDayNum(6);

  return {
    [mon]: [
      { time: '09:00 AM', title: 'Weekly Alignment Briefing', lead: 'CEO', type: 'Strategy', status: 'completed' },
      { time: '11:30 AM', title: 'Ad Campaign Budget Assessment', lead: 'CMO', type: 'Marketing', status: 'completed' },
      { time: '03:00 PM', title: 'SaaS Agreement Terms Audit', lead: 'LEGAL', type: 'Compliance', status: 'completed' }
    ],
    [tue]: [
      { time: '10:00 AM', title: 'Docker Container Re-indexing', lead: 'CTO', type: 'DevOps', status: 'completed' },
      { time: '02:30 PM', title: 'Operational Automation Audit', lead: 'COO', type: 'Operations', status: 'completed' }
    ],
    [wed]: [
      { time: '09:00 AM', title: 'Corporate Treasury Allocation', lead: 'CFO', type: 'Finance', status: 'completed' },
      { time: '04:00 PM', title: 'Social Reach Keywords Sync', lead: 'CMO', type: 'Marketing', status: 'completed' }
    ],
    [thu]: [
      { time: '11:00 AM', title: 'Database log index compaction', lead: 'CTO', type: 'Engineering', status: 'completed' },
      { time: '03:30 PM', title: 'IP Application Submission', lead: 'LEGAL', type: 'Compliance', status: 'completed' }
    ],
    [fri]: [
      { time: '10:30 AM', title: 'Runway Projection Calculation', lead: 'CFO', type: 'Finance', status: 'completed' },
      { time: '01:00 PM', title: 'Sprint Backlog Indexing', lead: 'COO', type: 'Operations', status: 'completed' }
    ],
    [sat]: [
      { time: '09:00 AM', title: 'C-Suite Strategic Sync', lead: 'CEO', type: 'Strategy', status: 'completed' },
      { time: '11:00 AM', title: 'Automatic Production Deployment', lead: 'CTO', type: 'DevOps', status: 'completed' },
      { time: '02:00 PM', title: 'Runway & Billing Audit Checkpoint', lead: 'CFO', type: 'Finance', status: 'upcoming' },
      { time: '04:30 PM', title: 'Social Copy Queue Dispatch', lead: 'CMO', type: 'Marketing', status: 'upcoming' },
      { time: '06:00 PM', title: 'Workspace Log Compression & Archive', lead: 'COO', type: 'Operations', status: 'upcoming' }
    ],
    [sun]: [
      { time: '12:00 PM', title: 'System Security Log Rotations', lead: 'CTO', type: 'DevOps', status: 'upcoming' },
      { time: '04:00 PM', title: 'Weekly Operations Sync Review', lead: 'COO', type: 'Operations', status: 'upcoming' }
    ]
  };
};

// Helper to ensure data directory and file exist
const ensureFileExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  let shouldCreate = !fs.existsSync(FILE_PATH);
  if (!shouldCreate) {
    try {
      const existing = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
      // if it has outdated keys, force recreation
      if (existing['22'] || existing['27']) {
        shouldCreate = true;
      }
    } catch (e) {
      shouldCreate = true;
    }
  }
  if (shouldCreate) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(getDefaultEvents(), null, 2), 'utf-8');
  }
};

// Read events helper
const readEvents = () => {
  ensureFileExists();
  try {
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading calendar JSON file:', error);
    return getDefaultEvents();
  }
};

// Write events helper
const writeEvents = (data) => {
  ensureFileExists();
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing calendar JSON file:', error);
    return false;
  }
};

export const getCalendar = async (req, res) => {
  const events = readEvents();
  res.json(events);
};

export const addCalendarEvent = async (req, res) => {
  const { day, time, title, lead, type, status = 'upcoming' } = req.body;
  if (!day || !title || !lead) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const events = readEvents();
  if (!events[day]) {
    events[day] = [];
  }

  events[day].push({ time, title, lead, type, status });
  writeEvents(events);
  res.json(events);
};

export const syncCalendarDay = async (req, res) => {
  const { day } = req.body;
  if (!day) {
    return res.status(400).json({ error: 'Missing day parameter' });
  }

  const events = readEvents();
  if (events[day]) {
    events[day] = events[day].map(evt => ({ ...evt, status: 'completed' }));
    writeEvents(events);
  }

  res.json(events);
};

// Helper function to programmatically add event (used by chatController)
export const addCalendarEventInternal = (eventData) => {
  const { day, time, title, lead, type, status = 'upcoming' } = eventData;
  if (!day || !title || !lead) {
    console.warn('Invalid event data for internal calendar scheduler:', eventData);
    return false;
  }

  const events = readEvents();
  if (!events[day]) {
    events[day] = [];
  }

  events[day].push({ time, title, lead, type, status });
  return writeEvents(events);
};
