export interface User {
  name: string;
  role: 'Founder';
  avatarUrl?: string;
  companyName: string;
}

export interface AIExecutive {
  id: string; // Dynamic ID, e.g., 'ceo', 'cto', etc.
  name: string;
  role: string; // e.g., 'Chief Executive Officer'
  icon: string; // Lucide icon name
  avatar: string; // Face avatar Unsplash URL
  description: string;
  themeColor: string; // Tailwind class, e.g. 'text-violet-400'
  accentColor: string; // Hex code for glowing effects
  status: 'online' | 'analyzing' | 'idle' | 'offline';
  department: string; // e.g. 'Executive', 'Engineering'
  systemPrompt: string; // Core AI prompt directives
  futureTools: string[]; // List of tools the agent can invoke
  model: string; // AI model used
}

export interface NavItem {
  name: string;
  path: string;
  icon: string;
  executiveId?: string;
  badge?: string | number;
}
