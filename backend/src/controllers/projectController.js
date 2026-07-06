import { prisma } from '../config/db.js';

export let fallbackProjects = [
  { id: 'fallback-1', title: 'SEO Keyword Re-indexing', dept: 'Marketing', owner: 'Nova Sparks', level: 'Medium', column: 'Backlog' },
  { id: 'fallback-2', title: 'Asset Reserve Auditing', dept: 'Finance', owner: 'Ledger Vance', level: 'Low', column: 'Backlog' },
  { id: 'fallback-3', title: 'Database Index Compression', dept: 'Engineering', owner: 'Byte Weaver', level: 'High', column: 'In Progress' },
  { id: 'fallback-4', title: 'Privacy Policy Validation', dept: 'Legal', owner: 'Justice Code', level: 'High', column: 'In Review' },
  { id: 'fallback-5', title: 'SaaS App Authentication', dept: 'Engineering', owner: 'Byte Weaver', level: 'Medium', column: 'In Review' },
  { id: 'fallback-6', title: 'GKE Cloud Deployment', dept: 'Engineering', owner: 'Byte Weaver', level: 'High', column: 'Done' },
  { id: 'fallback-7', title: 'Runway Forecast Model v2', dept: 'Finance', owner: 'Ledger Vance', level: 'Medium', column: 'Done' },
  { id: 'fallback-8', title: 'Social Copy Queue Dispatch', dept: 'Marketing', owner: 'Nova Sparks', level: 'Low', column: 'Done' },
];

const groupTasks = (dbTasks) => {
  return [
    {
      title: 'Backlog',
      count: dbTasks.filter(t => t.column === 'Backlog').length,
      tasks: dbTasks.filter(t => t.column === 'Backlog')
    },
    {
      title: 'In Progress',
      count: dbTasks.filter(t => t.column === 'In Progress').length,
      tasks: dbTasks.filter(t => t.column === 'In Progress')
    },
    {
      title: 'In Review',
      count: dbTasks.filter(t => t.column === 'In Review').length,
      tasks: dbTasks.filter(t => t.column === 'In Review')
    },
    {
      title: 'Done',
      count: dbTasks.filter(t => t.column === 'Done').length,
      tasks: dbTasks.filter(t => t.column === 'Done')
    }
  ];
};

export const getProjects = async (req, res) => {
  try {
    const dbTasks = await prisma.project.findMany();
    res.json(groupTasks(dbTasks));
  } catch (error) {
    console.warn("Database connection failure. Resolving local fallback projects.");
    res.json(groupTasks(fallbackProjects));
  }
};

export const updateProjectColumn = async (req, res) => {
  const { id } = req.params;
  const { column } = req.body;
  
  try {
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { column }
    });
    res.json(updatedProject);
  } catch (error) {
    console.warn(`Database connection failure. Updating project ${id} in memory fallback.`);
    const existing = fallbackProjects.find(p => p.id === id);
    if (existing) {
      existing.column = column;
      res.json(existing);
    } else {
      res.status(404).json({ error: "Project not found in fallback storage" });
    }
  }
};

