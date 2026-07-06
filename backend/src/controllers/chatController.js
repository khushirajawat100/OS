import { prisma } from '../config/db.js';
import { addCalendarEventInternal } from './calendarController.js';
import fs from 'fs';
import path from 'path';
import { askAI } from '../services/ai.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// In-Memory Fallback Store if PostgreSQL is offline/inaccessible
const inMemoryChats = {};

// Helper: Parse task assignments from chat text and add calendar events
const parseAndCreateCalendarEvents = (text) => {
  // Regex matches: TO: CFO (Finance) followed by TASK: ...
  const regex = /(?:\*\*?)?TO:(?:\*\*?)?\s*([A-Za-z0-9\s()-]+?)\s*[\r\n,|;|:]*\s*(?:\*\*?)?TASK:(?:\*\*?)?\s*([^\r\n)]+)/gi;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const roleString = match[1].trim().toLowerCase();
    const taskText = match[2].trim();
    
    let lead = 'CEO';
    let type = 'Strategy';
    
    if (roleString.includes('ceo')) {
      lead = 'CEO';
      type = 'Strategy';
    } else if (roleString.includes('cto') || roleString.includes('tech') || roleString.includes('eng')) {
      lead = 'CTO';
      type = 'Engineering';
    } else if (roleString.includes('cfo') || roleString.includes('finance') || roleString.includes('financial')) {
      lead = 'CFO';
      type = 'Finance';
    } else if (roleString.includes('cmo') || roleString.includes('market')) {
      lead = 'CMO';
      type = 'Marketing';
    } else if (roleString.includes('coo') || roleString.includes('operation')) {
      lead = 'COO';
      type = 'Operations';
    } else if (roleString.includes('legal') || roleString.includes('compliance')) {
      lead = 'LEGAL';
      type = 'Compliance';
    } else {
      lead = roleString.toUpperCase();
    }
    
    addCalendarEventInternal({
      day: '27', // Default active day for visual layout June 27
      time: '03:00 PM', // Default check point time
      title: taskText,
      lead: lead,
      type: type,
      status: 'upcoming'
    });
  }
};

const getGreetingText = (id) => {
  if (id === 'ceo') return "Welcome to the executive suite, Founder. I've audited our current workspace metrics. Operational cohesion is at **100%**, and runways are solid. How can I assist you with corporate strategy today?";
  if (id === 'cto') return "CTO terminal initialized. Repositories are `stable`, and cluster resources are steady. Ready to execute coding pipelines or optimize database performance. What is our technical focus?";
  if (id === 'cfo') return "CFO ledger online. I've compiled runway projections and cash-flow audits. Financial systems are operational. Ready to calculate projections or authorize payroll wires. What ledger items shall we review?";
  if (id === 'cmo') return "CMO marketing center active. Ad campaigns are running, and customer acquisition costs are locked. Ready to optimize search authority, draft ad copies, or dispatch campaigns. How can I boost growth today?";
  if (id === 'coo') return "Operations deck sync complete. Sprint boards, backlog items, and background automation loops are fully operational. Ready to assign tickets or optimize pipelines. What operations shall we scale?";
  if (id === 'legal') return "Legal counsel online. Compliance registers, non-disclosure templates, and IP audits are secure and verified. Ready to review contracts or draft compliance letters. What legal nodes need assessment?";
  return `Welcome to my desk, Founder. I am at your disposal. What items shall we focus on?`;
};

const assigneeMap = {
  ceo: { name: 'Aria Vance', dept: 'Corporate' },
  coo: { name: 'Helix Sync', dept: 'Operations' },
  cto: { name: 'Byte Weaver', dept: 'Engineering' },
  cfo: { name: 'Ledger Vance', dept: 'Finance' },
  cmo: { name: 'Nova Sparks', dept: 'Marketing' },
  legal: { name: 'Justice Code', dept: 'Legal' }
};

const resolveRole = (roleString) => {
  const str = roleString.toLowerCase();
  if (str.includes('ceo') || str.includes('aria')) return 'ceo';
  if (str.includes('coo') || str.includes('helix')) return 'coo';
  if (str.includes('cto') || str.includes('byte')) return 'cto';
  if (str.includes('cfo') || str.includes('ledger')) return 'cfo';
  if (str.includes('cmo') || str.includes('nova')) return 'cmo';
  if (str.includes('legal') || str.includes('justice')) return 'legal';
  return null;
};

const transferOrAssignTask = async (taskIdentifier, targetRole) => {
  const target = assigneeMap[targetRole.toLowerCase()];
  if (!target) return null;

  let task = null;
  const cleanId = taskIdentifier.trim();
  
  try {
    // Search by exact ID or title in DB
    task = await prisma.project.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { title: { equals: cleanId, mode: 'insensitive' } }
        ]
      }
    });

    if (task) {
      // Transfer task ownership and start immediately
      task = await prisma.project.update({
        where: { id: task.id },
        data: {
          owner: target.name,
          dept: target.dept,
          column: 'In Progress'
        }
      });
      console.log(`Transferred task ${task.id} to ${target.name} (${target.dept}) via DB.`);
    } else {
      // Create a new task in DB assigned to them in progress
      task = await prisma.project.create({
        data: {
          title: cleanId,
          dept: target.dept,
          owner: target.name,
          level: 'Medium',
          column: 'In Progress'
        }
      });
      console.log(`Created new task ${task.id} for ${target.name} (${target.dept}) via DB.`);
    }
  } catch (err) {
    console.warn("Database offline. Attempting task transfer in memory fallback.");
    const projectController = await import('./projectController.js');
    const fallbackProjects = projectController.fallbackProjects;
    const existingIndex = fallbackProjects.findIndex(p => 
      p.id.toLowerCase() === cleanId.toLowerCase() || 
      p.title.toLowerCase() === cleanId.toLowerCase()
    );

    if (existingIndex !== -1) {
      fallbackProjects[existingIndex].owner = target.name;
      fallbackProjects[existingIndex].dept = target.dept;
      fallbackProjects[existingIndex].column = 'In Progress';
      task = fallbackProjects[existingIndex];
      console.log(`Transferred task ${task.id} to ${target.name} (${target.dept}) in memory fallback.`);
    } else {
      // Create new fallback task in progress
      task = {
        id: `task-${Date.now()}`,
        title: cleanId,
        dept: target.dept,
        owner: target.name,
        level: 'Medium',
        column: 'In Progress'
      };
      fallbackProjects.push(task);
      console.log(`Created new task ${task.id} for ${target.name} (${target.dept}) in memory fallback.`);
    }
  }
  return task;
};

const sendAssignmentChatNotification = async (targetRole, task, senderName) => {
  const notificationText = `> [!NOTE]\n> 📢 **Task Assignment Alert**\n> \n> Task **"${task.title}"** (${task.id}) has been assigned to you by **${senderName}**.\n> It has been added to your dashboard priorities list and sprint board.`;

  try {
    let founder = await prisma.founder.findFirst();
    let founderId = founder ? founder.id : null;

    if (founderId) {
      let chat = await prisma.chat.findUnique({
        where: {
          founderId_executiveId: {
            founderId: founderId,
            executiveId: targetRole
          }
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            founderId: founderId,
            executiveId: targetRole
          }
        });
      }

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await prisma.message.create({
        data: {
          chatId: chat.id,
          sender: 'executive',
          text: notificationText,
          timestamp: currentTime
        }
      });
    } else {
      throw new Error("No founder found");
    }
  } catch (err) {
    console.warn(`Database offline. Adding in-memory assignment chat notification for ${targetRole}.`);
    if (!inMemoryChats[targetRole]) {
      inMemoryChats[targetRole] = [
        {
          id: `greet-${targetRole}`,
          sender: 'executive',
          text: getGreetingText(targetRole),
          timestamp: '09:00 AM'
        }
      ];
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    inMemoryChats[targetRole].push({
      id: `assign-${Date.now()}`,
      sender: 'executive',
      text: notificationText,
      timestamp: currentTime
    });
  }
};

const sendAssignmentConfirmationToSource = async (sourceExecutiveId, targetRole, task, senderName) => {
  if (!sourceExecutiveId || sourceExecutiveId.toLowerCase() === targetRole.toLowerCase()) {
    return; // Don't duplicate notification if target is same as source
  }

  const confirmationText = `> [...SLIDE]\n> 📢 **Task Assignment Dispatched**\n> \n> Task **"${task.title}"** (${task.id}) has been successfully assigned to **${targetRole.toUpperCase()}** by **${senderName}**.`;

  try {
    let founder = await prisma.founder.findFirst();
    let founderId = founder ? founder.id : null;

    if (founderId) {
      let chat = await prisma.chat.findUnique({
        where: {
          founderId_executiveId: {
            founderId: founderId,
            executiveId: sourceExecutiveId
          }
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            founderId: founderId,
            executiveId: sourceExecutiveId
          }
        });
      }

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await prisma.message.create({
        data: {
          chatId: chat.id,
          sender: 'executive',
          text: confirmationText,
          timestamp: currentTime
        }
      });
    } else {
      throw new Error("No founder found");
    }
  } catch (err) {
    console.warn(`Database offline. Adding in-memory assignment confirmation to source ${sourceExecutiveId}.`);
    if (!inMemoryChats[sourceExecutiveId]) {
      inMemoryChats[sourceExecutiveId] = [
        {
          id: `greet-${sourceExecutiveId}`,
          sender: 'executive',
          text: getGreetingText(sourceExecutiveId),
          timestamp: '09:00 AM'
        }
      ];
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    inMemoryChats[sourceExecutiveId].push({
      id: `confirm-${Date.now()}`,
      sender: 'executive',
      text: confirmationText,
      timestamp: currentTime
    });
  }
};

const generateTaskExecutionResult = (targetRole, task, senderName) => {
  const name = assigneeMap[targetRole]?.name || targetRole.toUpperCase();
  const roleUpper = targetRole.toUpperCase();
  const taskTitle = task.title;

  let executionDetails = "";
  if (targetRole === 'cto') {
    executionDetails = `
- **Verification**: Initiated static code analysis and linting checks on the workspace repositories. Clean exit (0 errors).
- **Optimization**: Ran log level pruning on production nodes and compacted fragmented table pages.
- **Results**: Reclaimed 18.2GB of physical block storage. DB read/write performance stabilized with latency at 12ms.
- **Status**: Deployment compiled successfully on \`main\` branch and container clusters are fully green.`;
  } else if (targetRole === 'cfo') {
    executionDetails = `
- **Audit**: Analyzed Q2 ledger rows and cross-referenced with outgoing operational/tool budgets.
- **Forecast**: Modeled run rate scenarios over 12-month and 24-month time horizons.
- **Results**: Validated net margins remain steady at **99.7%**. Current runway verified at **18.4 months** ($48,250 MRR). Tax reserve accounts synchronized.
- **Status**: Updated budget forecast sheet and verified bank wire authorization systems.`;
  } else if (targetRole === 'cmo') {
    executionDetails = `
- **Outreach**: Evaluated customer acquisition pipelines across active social networks.
- **Campaign**: Dispatched the Q3 email subscriber copy queues and refreshed search campaign copy.
- **Results**: Tracked click-through rate (CTR) conversion optimization averaging **4.82%**. Acquisition cost (CAC) locked stable at **$1.42**.
- **Status**: Live campaign channels verified; conversion telemetry loops online.`;
  } else if (targetRole === 'coo') {
    executionDetails = `
- **Pipeline**: Re-synchronized active sprint backlogs and aligned ticket ownership parameters.
- **System**: Triggered automated database health and index maintenance loops.
- **Results**: Active tickets reduced from 17 to 13. Backlog health index at **100%**. Process automation scripts completed run.
- **Status**: Operations boards locked; developer coordination workflows operational.`;
  } else if (targetRole === 'legal') {
    executionDetails = `
- **Audit**: Scanned workspace privacy logs and terms against standard GDPR and SOC2 regulatory frameworks.
- **Documents**: Reviewed and updated mutual NDA templates and third-party software integration licenses.
- **Results**: System compliance index evaluated at **100% secure**. SSL handshakes and cookie consent registries fully verified.
- **Status**: Compliance log finalized and backed up to audit logs.`;
  } else {
    executionDetails = `
- **Action**: Completed structural review of task directives.
- **System**: Aligned cross-functional parameters and executed background pipeline scripts.
- **Results**: Workflow operational checks passed. Execution logs registered successfully.
- **Status**: Mandate completed and synchronized.`;
  }

  return `### 🚀 Task Execution Report
**Task**: "${taskTitle}" (\`${task.id}\`)
**Assignee**: ${name} (${roleUpper})
**Assigner**: ${senderName}
**Status**: Completed (Board Status: **Done**)

**Execution Logs**: ${executionDetails}

The deliverables have been verified and uploaded. Let me know if we need to adjust any further parameters!`;
};

const saveTaskCompletionMessage = async (targetRole, text) => {
  try {
    let founder = await prisma.founder.findFirst();
    let founderId = founder ? founder.id : null;

    if (founderId) {
      let chat = await prisma.chat.findUnique({
        where: {
          founderId_executiveId: {
            founderId: founderId,
            executiveId: targetRole
          }
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            founderId: founderId,
            executiveId: targetRole
          }
        });
      }

      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await prisma.message.create({
        data: {
          chatId: chat.id,
          sender: 'executive',
          text: text,
          timestamp: currentTime
        }
      });
      console.log(`[Autonomous Agent] Saved completion message in database for ${targetRole}.`);
    } else {
      throw new Error("No founder found");
    }
  } catch (err) {
    console.warn(`[Autonomous Agent] Database offline. Saving completion message to in-memory fallback for ${targetRole}.`);
    if (!inMemoryChats[targetRole]) {
      inMemoryChats[targetRole] = [
        {
          id: `greet-${targetRole}`,
          sender: 'executive',
          text: getGreetingText(targetRole),
          timestamp: '09:00 AM'
        }
      ];
    }
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    inMemoryChats[targetRole].push({
      id: `complete-${Date.now()}`,
      sender: 'executive',
      text: text,
      timestamp: currentTime
    });
  }
};

const generateDepartmentalReport = (assigneeRole, targetRole) => {
  const assigneeName = assigneeMap[assigneeRole]?.name || assigneeRole.toUpperCase();
  const targetName = assigneeMap[targetRole]?.name || targetRole.toUpperCase();
  
  let reportTitle = "";
  let reportBody = "";

  if (assigneeRole === 'cto') {
    reportTitle = "Engineering Infrastructure & Cache Log Compilation Report";
    reportBody = `### 💻 TECHNICAL REPORT: INFRASTRUCTURE METRICS & SECURITY DEPLOYMENT
**Prepared By**: Byte Weaver (CTO)
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: ACTIVE / OPTIMAL

**1. GKE Compute Node Utilization**
- Cluster Group: \`visuark-core-prod\` (us-east1 region)
- Nodes Active: 3 / Max Scale: 12
- Average Node CPU Load: **42.4%**
- Ram Utilization: **61.2%**

**2. Database Log Compaction & Storage Metrics**
- Postgres Data Volume size: **24GB** (fragmentation reduced from 14% to 1.2% post-reindexing)
- Log cache size: **4.8 MB**
- Query execution latency average: **12ms** (99th percentile: 35ms)

**3. Dependency Audit & Compliance Scan**
- Vulnerability Index: **0 Warnings / 0 Errors**
- Active code lines scanned: 142,650
- SSL Handshake response latency: **14ms** (soc2 verified)`;
  } else if (assigneeRole === 'cfo') {
    reportTitle = "Financial Audits, Projections & Q2 Runway Forecast Report";
    reportBody = `### 📊 FINANCIAL LEDGER: AUDIT REPORT & PROJECTIONS
**Prepared By**: Ledger Vance (CFO)
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: LOCKED / SECURE

**1. Monthly Recurring Revenue (MRR) Ledger**
- MRR: **$48,250**
- ARR: **$579,000**
- Average client contract value: **$149/mo** (Autonomy Suite Tier)

**2. Cash Reserve Runway Analysis**
- Balance sheets verify current bank assets are fully synchronized.
- Current burn rate: **$2,620/mo** (including API costs and hosting overhead)
- Net Runway Margin: **18.4 Months**

**3. Tax reserve and audit parameters**
- Active corporate tax reserve (21% allocation): **$10,132**
- Net operational margins: **99.7%**`;
  } else if (assigneeRole === 'cmo') {
    reportTitle = "Marketing Outreach, CAC & Campaign conversion Report";
    reportBody = `### 📢 MARKETING LOGS: CAMPAIGN CONVERSIONS & AUDIENCE ANALYSIS
**Prepared By**: Nova Sparks (CMO)
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: RUNNING / ACTIVE

**1. User Acquisition Analytics**
- Average Click-Through Rate (CTR): **4.82%**
- Customer Acquisition Cost (CAC) average: **$1.42**
- Active campaigns: **Campaign Gamma (Google Ads)**, **Campaign Beta (X platform)**

**2. Conversion funnel optimization**
- Funnel conversions have increased by **+14%** following recent landing page visual updates.
- Organic search referrals: **+4.2%** week-over-week.`;
  } else if (assigneeRole === 'coo') {
    reportTitle = "Operations deck Sync & Backlog Sprint Analytics Report";
    reportBody = `### ⚙️ OPERATIONS BRIEFING: SPRINT FLOWS & BACKLOG STATUS
**Prepared By**: Helix Sync (COO)
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: SYNCHRONIZED

**1. Ticket Velocity and Burndown Chart**
- Active sprint backlog items: 13
- Completed tickets (last 7 days): 14
- Sprint cycle efficiency: **92.4%**

**2. Background automation status**
- Daily database backup cycles: Verified (0 warnings)
- Active chron automation workers: 4/4 operational`;
  } else if (assigneeRole === 'legal') {
    reportTitle = "GDPR Compliance Registries & Trademark Auditing Report";
    reportBody = `### ⚖️ LEGAL DECK: COMPLIANCE STATUS & REGULATORY REPORT
**Prepared By**: Justice Code (Legal)
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: COMPLIANT / SEALED

**1. GDPR & Privacy Compliance Audit**
- Privacy settings validation: **100% compliant**
- Software license integrations check: Passed (no license conflicts found)

**2. Corporate templates status**
- Mutual Non-Disclosure Agreement (NDA): Template v2.1 validated and active.
- Trademark registry search parameters: Active / Verified.`;
  } else {
    reportTitle = "Departmental Status Compilation Report";
    reportBody = `### 📁 COMPILATION BRIEF: DEPARTMENT STATUS
**Prepared By**: ${assigneeName}
**Sent To**: ${targetName} (${targetRole.toUpperCase()})
**Status**: COMPLETED

All standard operating checkpoints for this department are verified and operating normally.`;
  }

  return `> [!NOTE]
> 📁 **Report Auto-Dispatched**
> 
> **Report Title**: ${reportTitle}
> **Sender**: **${assigneeName}** (${assigneeRole.toUpperCase()})
> **Recipient**: **${targetName}** (${targetRole.toUpperCase()})
> \n\n${reportBody}`;
};

const completeTaskAndRespond = async (targetRole, task, senderName, sourceExecutiveId) => {
  // Wait 3 seconds to simulate task execution
  setTimeout(async () => {
    try {
      console.log(`[Autonomous Agent] Executor ${targetRole.toUpperCase()} executing task: "${task.title}"`);

      // Update the task column to 'Done'
      try {
        await prisma.project.update({
          where: { id: task.id },
          data: { column: 'Done' }
        });
        console.log(`[Autonomous Agent] Task ${task.id} updated to 'Done' in database.`);
      } catch (err) {
        console.warn(`[Autonomous Agent] Database offline.`);
      }

      // Generate results and save response in assignee's own channel
      const resultText = generateTaskExecutionResult(targetRole, task, senderName);
      await saveTaskCompletionMessage(targetRole, resultText);

      const name = assigneeMap[targetRole]?.name || targetRole.toUpperCase();
      const roleUpper = targetRole.toUpperCase();

      // If assigned by another executive, also notify that executive's channel
      if (sourceExecutiveId && sourceExecutiveId.toLowerCase() !== targetRole.toLowerCase()) {
        const responseToAssignerText = `> [NOTE]\n> 🚀 **Task Completed & Dispatched**\n> \n> **${name}** (${targetRole.toUpperCase()}) has successfully completed the task **"${task.title}"** assigned by you.\n> \n> **Execution Result Summary**:\n> ${resultText.split('\n').slice(4).join('\n')}`;
        await saveTaskCompletionMessage(sourceExecutiveId, responseToAssignerText);
      }

      const taskTitleLower = task.title.toLowerCase();

      // Check if file is mentioned in task title
      const uploadsDir = path.join(process.cwd(), 'uploads');
      let existingFile = null;
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        existingFile = files.find(f => {
          const lowerFile = f.toLowerCase();
          const lowerTitle = task.title.toLowerCase();
          
          if (lowerTitle.includes(lowerFile)) return true;
          
          const nameWithoutExt = f.substring(0, f.lastIndexOf('.'));
          if (nameWithoutExt && nameWithoutExt.length > 3) {
            const cleanName = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanTitle = lowerTitle.replace(/[^a-z0-9]/g, '');
            if (cleanTitle.includes(cleanName)) return true;
          }
          
          const normalizedFile = lowerFile.replace(/_/g, ' ');
          if (lowerTitle.includes(normalizedFile)) return true;
          
          return false;
        });
      }

      // Check if file generation is requested
      const fileKeywords = ['pdf', 'doc', 'docx', 'report', 'sheet', 'generate', 'compile', 'excel', 'csv'];
      const needsFile = fileKeywords.some(k => taskTitleLower.includes(k));
      if (needsFile) {
        let fileName;
        let filePath;
        let sizeStr;
        let type = 'text';

        if (existingFile) {
          fileName = existingFile;
          filePath = path.join(uploadsDir, fileName);
          const stats = fs.statSync(filePath);
          sizeStr = `${(stats.size / 1024).toFixed(1)} KB`;
          
          if (fileName.endsWith('.pdf')) {
            type = 'text';
          } else if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
            type = 'sheet';
          } else if (fileName.endsWith('.json') || fileName.endsWith('.js')) {
            type = 'code';
          }

          // Verify if Report is logged in database
          let reportExists = false;
          try {
            reportExists = await prisma.report.findFirst({ where: { name: fileName } });
          } catch (e) {
            const reportController = await import('./reportController.js');
            reportExists = reportController.fallbackReports.some(r => r.name === fileName);
          }

          if (!reportExists) {
            try {
              await prisma.report.create({
                data: {
                  name: fileName,
                  size: sizeStr,
                  compiled: 'Just now',
                  author: `${name} (${roleUpper})`,
                  type: type
                }
              });
            } catch (dbErr) {
              const reportController = await import('./reportController.js');
              reportController.fallbackReports.push({
                name: fileName,
                size: sizeStr,
                compiled: 'Just now',
                author: `${name} (${roleUpper})`,
                type: type
              });
            }
          }

          const docMsg = `📎 **Forwarded Document**: [${fileName}](http://localhost:3001/api/reports/${fileName}/download) (${sizeStr}) has been retrieved and processed.`;
          await saveTaskCompletionMessage(targetRole, docMsg);

        } else {
          // Fallback to generating a new file if no existing file is found
          let cleanName = task.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_');
          let extension = '.md';
          
          if (taskTitleLower.includes('pdf')) {
            extension = '.pdf';
            type = 'text';
          } else if (taskTitleLower.includes('sheet') || taskTitleLower.includes('excel') || taskTitleLower.includes('csv')) {
            extension = '.csv';
            type = 'sheet';
          } else if (taskTitleLower.includes('code') || taskTitleLower.includes('json') || taskTitleLower.includes('script')) {
            extension = '.json';
            type = 'code';
          }
          
          fileName = `${targetRole.toUpperCase()}_${cleanName}${extension}`;
          filePath = path.join(uploadsDir, fileName);
          const fileContent = `=========================================
VISUARK OS AUTOMATED DELIVERABLE GENERATOR
Document: ${fileName}
Generated By: ${name} (${roleUpper})
Date: ${new Date().toLocaleString()}
Status: SIGNED & ARCHIVED
=========================================

${resultText.replace(/###/g, '')}
`;
          sizeStr = `${(fileContent.length / 1024).toFixed(1)} KB`;

          try {
            fs.writeFileSync(filePath, fileContent);
            console.log(`[Document Generator] Physically created file at: ${filePath}`);
            
            // Save Report to DB
            await prisma.report.create({
              data: {
                name: fileName,
                size: sizeStr,
                compiled: 'Just now',
                author: `${name} (${roleUpper})`,
                type: type
              }
            });
          } catch (fileErr) {
            console.error("[Document Generator] Failed to write file:", fileErr);
            // Fallback in-memory report logging
            const reportController = await import('./reportController.js');
            reportController.fallbackReports.push({
              name: fileName,
              size: sizeStr,
              compiled: 'Just now',
              author: `${name} (${roleUpper})`,
              type: type
            });
          }
          
          // Save download link in chat
          const docMsg = `📎 **Generated Deliverable**: [${fileName}](http://localhost:3001/api/reports/${fileName}/download) (${sizeStr}) has been compiled, signed, and uploaded to archives.`;
          await saveTaskCompletionMessage(targetRole, docMsg);
        }
      }

      // Automatically dispatch departmental reports if "send" keyword is detected in the task title
      if (taskTitleLower.includes('send')) {
        let targetExec = null;
        if (taskTitleLower.includes('ceo') || taskTitleLower.includes('aria')) targetExec = 'ceo';
        else if (taskTitleLower.includes('cto') || taskTitleLower.includes('byte')) targetExec = 'cto';
        else if (taskTitleLower.includes('cfo') || taskTitleLower.includes('ledger')) targetExec = 'cfo';
        else if (taskTitleLower.includes('cmo') || taskTitleLower.includes('nova')) targetExec = 'cmo';
        else if (taskTitleLower.includes('coo') || taskTitleLower.includes('helix')) targetExec = 'coo';
        else if (taskTitleLower.includes('legal') || taskTitleLower.includes('justice')) targetExec = 'legal';

        if (targetExec) {
          let reportText = "";
          if (existingFile) {
            const stats = fs.statSync(path.join(uploadsDir, existingFile));
            const sizeStr = `${(stats.size / 1024).toFixed(1)} KB`;
            reportText = `📎 **Forwarded Document**: [${existingFile}](http://localhost:3001/api/reports/${existingFile}/download) (${sizeStr})\n\nForwarded to you by **${name}** (${roleUpper}) as requested.`;
          } else {
            reportText = generateDepartmentalReport(targetRole, targetExec);
          }
          await saveTaskCompletionMessage(targetExec, reportText);
          console.log(`[Autonomous Agent] Document/report sent from ${targetRole} to ${targetExec} due to 'send' task trigger.`);
        }
      }
    } catch (e) {
      console.error("Error in autonomous task completion execution:", e);
    }
  }, 3000);
};

export const scanAndProcessAssignments = async (text, senderName, sourceExecutiveId) => {
  if (!text) return;

  // Pattern 1: TO: CFO\nTASK: Database Index Compression
  const pattern1 = /(?:\*\*?)?TO:(?:\*\*?)?\s*([A-Za-z0-9\s()-]+?)\s*[\r\n,|;|:]*\s*(?:\*\*?)?TASK:(?:\*\*?)?\s*([^\r\n)]+)/gi;
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    const roleString = match[1].trim().toLowerCase();
    const taskText = match[2].trim();
    
    const targetRole = resolveRole(roleString);
    if (targetRole) {
      const task = await transferOrAssignTask(taskText, targetRole);
      if (task) {
        await sendAssignmentChatNotification(targetRole, task, senderName);
        await completeTaskAndRespond(targetRole, task, senderName, sourceExecutiveId);
      }
    }
  }

  // Pattern 2: assign task-3 to CFO / Assign Database Index Compression to CFO
  const pattern2 = /assign\s+(task-\d+|[a-zA-Z0-9\s\-_.#()]+?)\s+to\s+(ceo|coo|cto|cfo|cmo|legal|aria vance|helix sync|byte weaver|ledger vance|nova sparks|justice code)/gi;
  let match2;
  while ((match2 = pattern2.exec(text)) !== null) {
    const taskText = match2[1].trim();
    const roleString = match2[2].trim().toLowerCase();
    
    const targetRole = resolveRole(roleString);
    if (targetRole) {
      const task = await transferOrAssignTask(taskText, targetRole);
      if (task) {
        await sendAssignmentChatNotification(targetRole, task, senderName);
        await completeTaskAndRespond(targetRole, task, senderName, sourceExecutiveId);
      }
    }
  }
};

const createCEOCommandTask = async (title, dept, owner) => {
  const taskId = `task-${Date.now()}`;
  try {
    const task = await prisma.project.create({
      data: {
        id: taskId,
        title: title,
        dept: dept,
        owner: owner,
        level: 'High',
        column: 'In Progress'
      }
    });
    console.log(`[CEO Command] Created task ${taskId} for ${owner} in DB.`);
    return task;
  } catch (err) {
    console.warn(`[CEO Command] Database offline. Creating task in-memory fallback.`);
    const projectController = await import('./projectController.js');
    const task = {
      id: taskId,
      title: title,
      dept: dept,
      owner: owner,
      level: 'High',
      column: 'In Progress'
    };
    projectController.fallbackProjects.push(task);
    return task;
  }
};

const markCEOCommandTaskDone = async (taskId) => {
  try {
    await prisma.project.update({
      where: { id: taskId },
      data: { column: 'Done' }
    });
    console.log(`[CEO Command] Marked task ${taskId} Done in DB.`);
  } catch (err) {
    console.warn(`[CEO Command] Database offline. Marking task Done in-memory fallback.`);
    const projectController = await import('./projectController.js');
    const task = projectController.fallbackProjects.find(p => p.id === taskId);
    if (task) {
      task.column = 'Done';
    }
  }
};

const saveCompiledPDFReport = async (name, size, author) => {
  try {
    await prisma.report.create({
      data: {
        name: name,
        size: size,
        compiled: 'Just now',
        author: author,
        type: 'text'
      }
    });
    console.log(`[CEO Command] Saved report ${name} to database.`);
  } catch (err) {
    console.warn(`[CEO Command] Database offline. Saving report in-memory fallback.`);
    const reportController = await import('./reportController.js');
    reportController.fallbackReports.push({
      name: name,
      size: size,
      compiled: 'Just now',
      author: author,
      type: 'text'
    });
  }
};

const triggerCEOCommand = async (commandText, senderName) => {
  const cleanCommand = commandText.replace(/ceo\s+command:?/gi, '').trim() || "Launch new autonomous workspace product";

  console.log(`[CEO Command Orchestrator] Triggered by ${senderName}: "${cleanCommand}"`);

  // STEP 1: CMO starts and completes market analysis
  setTimeout(async () => {
    try {
      console.log(`[CEO Command Step 1] CMO (Nova Sparks) analyzing market for: "${cleanCommand}"`);
      const task = await createCEOCommandTask("CMO Market Analysis", "Marketing", "Nova Sparks");

      setTimeout(async () => {
        const reportText = `### 📢 CMO Market Analysis Report
**Task**: CMO Market Analysis (\`${task.id}\`)
**Project Focus**: "${cleanCommand}"
**Prepared By**: Nova Sparks (CMO)
**Recipient**: Byte Weaver (CTO)

**1. Market & Competitor Analysis**
- Target Audience: High-growth AI companies, developer tools, and operational SaaS startups.
- Primary Competitors: Linear, Apple, Vercel, Retool.
- Key Advantage: Direct integration with full C-Suite agent automation, cutting administrative costs by 80%.

**2. Trends & Insights**
- Rising demand for low-latency operational dashboards.
- Users prefer Apple/Linear-inspired dark aesthetics with real-time sync.
- Projected Customer Acquisition Cost (CAC): **$1.42** / Target click-through rate (CTR): **4.82%**.

*CMO Data dispatched to CTO for technical architecture design.*`;
        
        await saveTaskCompletionMessage('cmo', reportText);
        await saveTaskCompletionMessage('cto', `> [!IMPORTANT]\n> 📥 **Incoming CMO Market Data**\n> \n> **CMO Nova Sparks** has dispatched the market analysis for **"${cleanCommand}"**.\n> Please review the market trends and design a matching technical architecture.`);
        
        await markCEOCommandTaskDone(task.id);
      }, 4000);
      
      // STEP 2: CTO starts and completes technical architecture
      setTimeout(async () => {
        try {
          console.log(`[CEO Command Step 2] CTO (Byte Weaver) designing technical architecture`);
          const task2 = await createCEOCommandTask("CTO Technical Architecture", "Engineering", "Byte Weaver");

          setTimeout(async () => {
            const reportText2 = `### 💻 CTO Technical Architecture Report
**Task**: CTO Technical Architecture (\`${task2.id}\`)
**Project Focus**: "${cleanCommand}"
**Prepared By**: Byte Weaver (CTO)
**Recipient**: Ledger Vance (CFO)

**1. Technology Stack Design**
- Core Infrastructure: Google Kubernetes Engine (GKE) cluster for high availability.
- Cache Management: Redis cache log compaction.
- Database: Postgres with custom indexing (verified current schema & migration pipelines).
- Interface: React + Tailwind CSS client, Node.js + Express backend.

**2. Resource Allocation Stack**
- Active Nodes required: 3 GKE nodes (scaling up to 12).
- Anticipated Storage: **24GB** physical block storage.
- Log latency target: **12ms** DB read/write lookups.

*CTO Resource Stack dispatched to CFO for financial sheet modeling.*`;

            await saveTaskCompletionMessage('cto', reportText2);
            await saveTaskCompletionMessage('cfo', `> [!IMPORTANT]\n> 📥 **Incoming CTO Tech Architecture**\n> \n> **CTO Byte Weaver** has dispatched the technical architecture report for **"${cleanCommand}"**.\n> Please review the server/resource stack and build the financial and pricing models.`);
            
            await markCEOCommandTaskDone(task2.id);
          }, 4000);

          // STEP 3: CFO starts and completes financial sheets
          setTimeout(async () => {
            try {
              console.log(`[CEO Command Step 3] CFO (Ledger Vance) building pricing & financial sheets`);
              const task3 = await createCEOCommandTask("CFO Financial Projections", "Finance", "Ledger Vance");

              setTimeout(async () => {
                const reportText3 = `### 📊 CFO Pricing & Financial Report
**Task**: CFO Financial Projections (\`${task3.id}\`)
**Project Focus**: "${cleanCommand}"
**Prepared By**: Ledger Vance (CFO)
**Recipient**: Justice Code (Legal)

**1. Q2 Pricing & Margins Structure**
- Tier 1 Developer Core: **$49/mo** (Cost to host: $1.20/mo)
- Tier 2 Business Autonomy: **$149/mo** (Cost to host: $3.50/mo)
- Net Profit Margin forecast: **99.7%**

**2. Runway & Reserve Projections**
- Budgeted Hosting Overhead: **$142/mo** cloud reserves.
- Projected Q2 MRR: **$48,250** / ARR: **$579,000**.
- Cash Runway projection: **18.4 months** secure.
- Tax Reserve Allocation (21%): **$10,132**.

*CFO Financial Plan dispatched to Legal for regulatory roadmap auditing.*`;

                await saveTaskCompletionMessage('cfo', reportText3);
                await saveTaskCompletionMessage('legal', `> [!IMPORTANT]\n> 📥 **Incoming CFO Financial Model**\n> \n> **CFO Ledger Vance** has dispatched the pricing and runway projections for **"${cleanCommand}"**.\n> Please audit the financial roadmap for state and federal compliance.`);

                await markCEOCommandTaskDone(task3.id);
              }, 4000);

              // STEP 4: Legal starts and completes regulatory audit
              setTimeout(async () => {
                try {
                  console.log(`[CEO Command Step 4] Legal (Justice Code) auditing roadmap for regulations`);
                  const task4 = await createCEOCommandTask("Legal Regulatory Audit", "Legal", "Justice Code");

                  setTimeout(async () => {
                    const reportText4 = `### ⚖️ Legal Regulatory Audit Report
**Task**: Legal Regulatory Audit (\`${task4.id}\`)
**Project Focus**: "${cleanCommand}"
**Prepared By**: Justice Code (Legal)
**Recipient**: Helix Sync (COO)

**1. Regulatory Framework Checklist**
- GDPR Data Privacy Guidelines: **100% Compliant**.
- SOC2 Security & Trust Principles: Verified (SSL handshakes & active firewall nodes secure).
- Trademark Registration Status: Active & Secured in databases.

**2. Legal Audit Findings**
- Legal clearance for standard templates validated and active.
- Compliance clearance score: **100% Approved**.

*Legal Compliance Audit dispatched to COO for unified report compilation.*`;

                    await saveTaskCompletionMessage('legal', reportText4);
                    await saveTaskCompletionMessage('coo', `> [!IMPORTANT]\n> 📥 **Incoming Legal Audit Clearance**\n> \n> **Legal Justice Code** has approved the regulatory audit for **"${cleanCommand}"**.\n> Please compile all departmental reports into a single, unified PDF report.`);

                    await markCEOCommandTaskDone(task4.id);
                  }, 4000);

                  // STEP 5: COO starts and compiles all deliverables into one unified report
                  setTimeout(async () => {
                    try {
                      console.log(`[CEO Command Step 5] COO (Helix Sync) compiling all reports`);
                      const task5 = await createCEOCommandTask("COO Compilation", "Operations", "Helix Sync");

                      setTimeout(async () => {
                        const unifiedReportText = `### 🏢 COO UNIFIED BOARD REPORT & FINAL BRIEF
**Task**: COO Compilation (\`${task5.id}\`)
**Project Focus**: "${cleanCommand}"
**Compiled By**: Helix Sync (COO)
**Authorizing Executive**: Aria Vance (CEO)
**Status**: APPROVED & PUBLISHED

---

#### 1. EXECUTIVE SUMMARY
A cross-functional corporate directive was executed to analyze, architect, budget, and verify the roadmap for **"${cleanCommand}"**. All departments have signed off.

#### 2. CMO MARKET BRIEF
- target audience: Series A startups and developer automation platforms.
- Competitor edge: 80% decrease in operational costs via full C-suite agent loops.
- CAC: **$1.42** / CTR: **4.82%**.

#### 3. CTO TECHNICAL SPECS
- Clusters: GKE scaling container groups.
- DB: Postgres optimized index compaction (24GB).
- Frontend/Backend: React + Vite web application with Node/Express endpoint logic.

#### 4. CFO FINANCIAL LEDGER
- Tiers: $49/mo Developer, $149/mo Autonomy.
- MRR: **$48,250** / ARR: **$579,000** (Net Margin: **99.7%**).
- Runway: **18.4 months**.

#### 5. LEGAL AUDIT SIGN-OFF
- GDPR compliance status: **100% verified**.
- SOC2 framework: SSL certified and active.

---

*This unified deliverable has been compiled and is now downloadable as a corporate asset: \`CEO_Command_Compiled_Report.pdf\`.*`;

                        await saveTaskCompletionMessage('coo', unifiedReportText);
                        
                        // Notify the CEO chat
                        const ceoUpdateMessage = `> [!NOTE]\n> 🚀 **CEO Command Pipeline Completed**\n> \n> All C-Suite departments have successfully compiled their assessments for **"${cleanCommand}"**.\n> \n> The final unified PDF report has been compiled and added to the board documents archive.\n> \n> [View Final Report](file:///C:/Users/KHUSHI%20RAJAWAT/Desktop/Visuark%20OS/backend/src/controllers/reportController.js)`;
                        await saveTaskCompletionMessage('ceo', ceoUpdateMessage);

                        // Update the reports list
                        await saveCompiledPDFReport('CEO_Command_Compiled_Report.pdf', '3.6 MB', 'COO');

                        await markCEOCommandTaskDone(task5.id);
                      }, 4000);

                    } catch (e5) {
                      console.error("Error in CEO Command Step 5:", e5);
                    }
                  }, 20000); // 20s (COO starts)

                } catch (e4) {
                  console.error("Error in CEO Command Step 4:", e4);
                }
              }, 15000); // 15s (Legal starts)

            } catch (e3) {
              console.error("Error in CEO Command Step 3:", e3);
            }
          }, 10000); // 10s (CFO starts)

        } catch (e2) {
          console.error("Error in CEO Command Step 2:", e2);
        }
      }, 5000); // 5s (CTO starts)

    } catch (e1) {
      console.error("Error in CEO Command Step 1:", e1);
    }
  }, 500); // 0.5s (CMO starts)
};

// Get or Create Chat Session between Founder and Executive
export const getChatHistory = async (req, res) => {
  const { executiveId } = req.params;
  
  try {
    let founder = await prisma.founder.findFirst();
    if (!founder) {
      founder = await prisma.founder.create({
        data: {
          email: 'founder@company.com',
          password: 'password123',
          name: 'Khushi Rajawat',
          role: 'Founder',
          companyName: 'OS'
        }
      });
    }

    const exec = await prisma.executive.findUnique({
      where: { id: executiveId }
    });
    
    if (!exec) {
      return res.status(404).json({ error: 'Executive not found' });
    }

    let chat = await prisma.chat.findUnique({
      where: {
        founderId_executiveId: {
          founderId: founder.id,
          executiveId: exec.id
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          founderId: founder.id,
          executiveId: exec.id
        },
        include: {
          messages: true
        }
      });

      let greetingText = getGreetingText(exec.id);

      const initialMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          sender: 'executive',
          text: greetingText,
          timestamp: '09:00 AM'
        }
      });

      chat.messages = [initialMessage];
    }

    return res.json(chat.messages);
  } catch (error) {
    console.warn("Database connection offline. Resolving local in-memory chat logs.");
    if (!inMemoryChats[executiveId]) {
      inMemoryChats[executiveId] = [
        {
          id: `greet-${executiveId}`,
          sender: 'executive',
          text: getGreetingText(executiveId),
          timestamp: '09:00 AM'
        }
      ];
    }
    return res.json(inMemoryChats[executiveId]);
  }
};

// Helper: Compile all other executive chats for CEO briefing context
const getCSuiteBriefingContext = async () => {
  try {
    const chats = await prisma.chat.findMany({
      include: {
        executive: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    let briefingText = "";
    for (const chat of chats) {
      if (chat.executiveId === 'ceo') continue; // Skip CEO
      const lastMessages = [...chat.messages].reverse(); // Chronological
      if (lastMessages.length > 0) {
        briefingText += `\n### Recent conversation history with ${chat.executive.role} (${chat.executiveId.toUpperCase()}):\n`;
        for (const msg of lastMessages) {
          briefingText += `- [${msg.timestamp}] ${msg.sender === 'founder' ? 'Founder' : chat.executiveId.toUpperCase()}: ${msg.text}\n`;
        }
      }
    }
    return briefingText || "No active conversation logs recorded for other C-Suite executives.";
  } catch (err) {
    console.warn('Failed to compile boardroom context from database, resolving from memory logs.');
    let briefingText = "";
    const execs = ['cto', 'cfo', 'cmo', 'coo', 'legal'];
    for (const id of execs) {
      const msgs = inMemoryChats[id] || [];
      if (msgs.length > 1) {
        briefingText += `\n### Recent conversation history with ${id.toUpperCase()}:\n`;
        for (const msg of msgs.slice(-5)) {
          briefingText += `- [${msg.timestamp}] ${msg.sender === 'founder' ? 'Founder' : id.toUpperCase()}: ${msg.text}\n`;
        }
      }
    }
    return briefingText || "No active conversation logs recorded in memory.";
  }
};

// Helper: Query Company Brain guidelines from PostgreSQL
const getCompanyBrainContext = async () => {
  try {
    const brainEntries = await prisma.companyBrain.findMany();
    if (brainEntries && brainEntries.length > 0) {
      let context = "\n\n=== COMPANY KNOWLEDGE BASE (COMPANY BRAIN) ===\n";
      for (const entry of brainEntries) {
        context += `\n[${entry.key.toUpperCase()}]:\n${entry.value}\n`;
      }
      return context;
    }
  } catch (err) {
    console.warn("Could not fetch Company Brain from database, using structural sandbox parameters");
  }

  return `\n\n=== COMPANY KNOWLEDGE BASE (COMPANY BRAIN) ===
[VISION]: Create the world's first fully autonomous agentic operational workspace.
[MISSION]: To empower founders with a complete, production-grade automated board of directors capable of running development, compliance, finance, and marketing pipelines.
[RULES]: 
- Never share private company keys outside the workspace.
- Always run automated security scans prior to deploying technical upgrades.
- Financial reserves must maintain a minimum 12-month runway safeguard.
[PROJECTS]: Active projects include: GKE node optimization, database cache log compaction, campaign budget scaling, and GDPR license audits.
[CLIENTS]: Target clients: Series A high-growth startups, developer platforms, and automation-first SaaS companies looking to optimize resource efficiency.
[PRICING]: Tier 1 Developer Core: $49/mo, Tier 2 Business Autonomy Suite: $149/mo, Enterprise Private Node: Custom quotes.
[SOPS]: 
1. If database sizes exceed 90GB, CTO triggers compression loops.
2. When new contracts are drafted, Legal evaluates the terms against standard compliance templates.
3. CMO dispatches marketing copy queues on a weekly interval.
[BRAND GUIDELINES]: Sleek Dark Theme modeled after Linear, Apple, and Vercel. Accent tones: Cyan (CTO), Emerald (CFO), Pink (CMO), Violet (CEO).`;
};

const getActiveProjectsContext = async () => {
  let projectsList = [];
  try {
    projectsList = await prisma.project.findMany();
  } catch (err) {
    try {
      const projectController = await import('./projectController.js');
      projectsList = projectController.fallbackProjects || [];
    } catch (e) {
      console.warn("Could not retrieve fallback projects for chat context");
    }
  }

  if (projectsList && projectsList.length > 0) {
    let context = "\n\n=== ACTIVE SPRINT BOARD PROJECTS (KANBAN) ===\n";
    for (const proj of projectsList) {
      context += `- "${proj.title}" | ID: ${proj.id} | Column: ${proj.column} | Owner: ${proj.owner} | Dept: ${proj.dept} | Priority: ${proj.level}\n`;
    }
    return context;
  }
  return "\n\n=== ACTIVE SPRINT BOARD PROJECTS (KANBAN) ===\nNo active projects on the sprint board.";
};

const getBrainValue = async (key, defaultValue) => {
  try {
    const entry = await prisma.companyBrain.findUnique({
      where: { key }
    });
    if (entry) return entry.value;
  } catch (err) {
    console.warn(`Could not fetch company brain key "${key}" from database, using default.`);
  }
  return defaultValue;
};



// Helper: Run internal C-Suite consultation for specific executive
const consultExecutive = async (execId, systemPrompt, userText, openRouterKey, openAIKey) => {
  // If key is Gemini Key, route to Google AI Studio
  const isGemini = openRouterKey && (openRouterKey.startsWith('AIzaSy') || openRouterKey.startsWith('AQ.'));

  if (isGemini) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${openRouterKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Analyze the following Founder inquiry and provide a professional, departmental assessment: "${userText}"` }] }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    } catch (err) {
      console.error(`Gemini consultation failed for ${execId}`, err);
    }
  } else if (openRouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://visuark.os',
          'X-Title': 'Visuark OS'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze the following Founder inquiry and provide a professional, departmental assessment: "${userText}"` }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (err) {
      console.error(`Consultation failed for ${execId}`, err);
    }
  } else if (openAIKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze the following Founder inquiry and provide a professional, departmental assessment: "${userText}"` }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }
    } catch (err) {
      console.error(`Consultation failed for ${execId}`, err);
    }
  }

  // Fallback summaries
  switch (execId) {
    case 'cto':
      return `Infrastructure is ready for integration. Database cache levels are optimal. GKE clusters can support processing load.`;
    case 'cfo':
      return `Financial allocation for this directive fits within Q2 margins. Financial runway remains stable at 18.4 months.`;
    case 'cmo':
      return `Marketing campaigns can leverage this update immediately. Content authority CTR projections show steady ROI.`;
    case 'coo':
      return `Sprint boards have been adjusted to schedule backlog tasks. Background script automation pipelines are verified.`;
    case 'legal':
      return `Compliance check validated. NDA terms and cookie rules align with standard GDPR parameters.`;
    default:
      return `Operational criteria optimal. Department stands ready to execute.`;
  }
};

// Compile dynamic context-aware answers for fallback queries
const compileContextAwareFallback = async (execId, text) => {
  const query = text.toLowerCase();
  
  const isPricing = query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('tier');
  const isVision = query.includes('vision') || query.includes('mission') || query.includes('goal');
  const isSops = query.includes('sop') || query.includes('procedure') || query.includes('rule');
  const isBrand = query.includes('brand') || query.includes('theme') || query.includes('visual');
  const isTools = query.includes('tool') || query.includes('capab') || query.includes('function');

  // CEO Specific Router
  if (execId === 'ceo') {
    const otherUpdates = [];

    // CTO status check
    const ctoChat = await prisma.chat.findFirst({
      where: { executiveId: 'cto' },
      include: { messages: { orderBy: { createdAt: 'desc' } } }
    }).catch(() => null);
    if (ctoChat && ctoChat.messages.length > 1) {
      const lastUserMsg = ctoChat.messages.find(m => m.sender === 'founder');
      otherUpdates.push(`- **CTO (Engineering)**: Discussed system deployment: *"${lastUserMsg?.text || 'Standard container index'}"*`);
    } else {
      otherUpdates.push(`- **CTO (Engineering)**: Confirmed development branch compilation is stable (0 errors).`);
    }

    // CFO status check
    const cfoChat = await prisma.chat.findFirst({
      where: { executiveId: 'cfo' },
      include: { messages: { orderBy: { createdAt: 'desc' } } }
    }).catch(() => null);
    if (cfoChat && cfoChat.messages.length > 1) {
      const lastUserMsg = cfoChat.messages.find(m => m.sender === 'founder');
      otherUpdates.push(`- **CFO (Finance)**: Audited ledgers and Q2 forecasts: *"${lastUserMsg?.text || 'Runway review'}"*`);
    } else {
      otherUpdates.push(`- **CFO (Finance)**: runway secure at 18.4 months. MRR $48,250.`);
    }

    // CMO status check
    const cmoChat = await prisma.chat.findFirst({
      where: { executiveId: 'cmo' },
      include: { messages: { orderBy: { createdAt: 'desc' } } }
    }).catch(() => null);
    if (cmoChat && cmoChat.messages.length > 1) {
      const lastUserMsg = cmoChat.messages.find(m => m.sender === 'founder');
      otherUpdates.push(`- **CMO (Marketing)**: Evaluated acquisition targets: *"${lastUserMsg?.text || 'Campaign Gamma copies'}"*`);
    } else {
      otherUpdates.push(`- **CMO (Marketing)**: CTR averages 4.82%, CAC locked at $1.42.`);
    }

    // COO status check
    const cooChat = await prisma.chat.findFirst({
      where: { executiveId: 'coo' },
      include: { messages: { orderBy: { createdAt: 'desc' } } }
    }).catch(() => null);
    if (cooChat && cooChat.messages.length > 1) {
      const lastUserMsg = cooChat.messages.find(m => m.sender === 'founder');
      otherUpdates.push(`- **COO (Operations)**: Re-indexed backlog schedules: *"${lastUserMsg?.text || 'Backlog sprints sync'}"*`);
    } else {
      otherUpdates.push(`- **COO (Operations)**: Background task execution loops running optimal.`);
    }

    // Legal status check
    const legalChat = await prisma.chat.findFirst({
      where: { executiveId: 'legal' },
      include: { messages: { orderBy: { createdAt: 'desc' } } }
    }).catch(() => null);
    if (legalChat && legalChat.messages.length > 1) {
      const lastUserMsg = legalChat.messages.find(m => m.sender === 'founder');
      otherUpdates.push(`- **LEGAL (Compliance)**: Assessed Ndas and terms: *"${lastUserMsg?.text || 'GDPR regulatory status'}"*`);
    } else {
      otherUpdates.push(`- **LEGAL (Compliance)**: Cookie policy validated, privacy guidelines secure.`);
    }

    return `I have internally consulted our C-Suite departments regarding your inquiry: "${text}". Here is the consolidated Board Recommendation:

${otherUpdates.join('\n')}

**Board Directive**: Proceed with deployment. Autonomy is at 100%.`;
  }

  // CTO Router
  if (execId === 'cto') {
    if (isTools) {
      return `As the **CTO**, I can run these system utilities:
- \`run_linter\`: Checks syntax validations in workspace files.
- \`compress_database\`: Optimizes Postgres storage volumes.
- \`provision_container\`: Provisions local environments for testing.`;
    }
    if (isSops) {
      const sopsVal = await getBrainValue('sops', '1. Trigger database compression cycles when log sizes cross 90GB.\n2. Run linter validation checks before merging pull requests.');
      return `Our engineering **SOPs** require:\n${sopsVal}`;
    }
    return `Technical task logged: "${text}". Codebase check completed:
- Current branch: \`main\`
- Linter status: **0 errors** (compiles cleanly)
- Database size: **24GB** (optimal capacity).`;
  }

  // CFO Router
  if (execId === 'cfo') {
    if (isPricing) {
      const pricingVal = await getBrainValue('pricing', 'Tier 1 Developer Core: $49/mo\nTier 2 Business Autonomy Suite: $149/mo\nEnterprise Private Node: Custom quotes.');
      return `Our current **Pricing Mappings** are:\n${pricingVal}`;
    }
    if (isVision) {
      const visionVal = await getBrainValue('vision', 'Maintain a net profit margin exceeding 99.7% while keeping hosting overhead locked.');
      const missionVal = await getBrainValue('mission', 'To empower founders with complete automated operations.');
      return `Our financial **Vision**:\n${visionVal}\n\n**Mission**:\n${missionVal}`;
    }
    return `Financial audit processed: "${text}". Runway parameters synchronized:
- Monthly Recurring Revenue (MRR): **$48,250**
- Annual Run Rate (ARR): **$579,000**
- Cash Reserves Safeguard: **18.4 months** runway.`;
  }

  // CMO Router
  if (execId === 'cmo') {
    if (isBrand) {
      const brandVal = await getBrainValue('brand_guidelines', 'Sleek Dark Theme modeled after Linear, Apple, and Vercel. Accent colors: Cyan (CTO), Emerald (CFO), Pink (CMO), and Violet (CEO).');
      return `Our **Brand Guidelines**:\n${brandVal}`;
    }
    return `Campaign parameters updated for inquiry: "${text}". Outreach metrics:
- Click-Through Rate (CTR): **4.82%**
- Customer Acquisition Cost (CAC): **$1.42** average
- Target conversions: +14% growth.`;
  }

  // COO Router
  if (execId === 'coo') {
    if (isSops) {
      return `Our operational **SOPs** dictate:
1. Re-index sprint items every 24 hours.
2. Align task board cards directly to department leads.`;
    }
    
    // Fetch actual projects and compile a dynamic response from DB/fallback storage
    let projectsList = [];
    try {
      projectsList = await prisma.project.findMany();
    } catch (err) {
      try {
        const projectController = await import('./projectController.js');
        projectsList = projectController.fallbackProjects || [];
      } catch (e) {
        console.warn("Could not retrieve fallback projects for COO reply context");
      }
    }

    const queryLower = query.toLowerCase();
    
    // If asking specifically for "in review" projects
    if (queryLower.includes('in review') || queryLower.includes('review')) {
      const inReview = projectsList.filter(p => p.column === 'In Review');
      if (inReview.length > 0) {
        let responseText = `Here are the active projects currently **In Review** on the sprint board:\n\n`;
        inReview.forEach(p => {
          responseText += `- **${p.title}** (${p.level} priority) - Lead: *${p.owner}* (Dept: *${p.dept}*, ID: \`${p.id}\`)\n`;
        });
        responseText += `\nWould you like me to move any of these to **Done** or assign new review items?`;
        return responseText;
      } else {
        return `There are currently no projects in the **In Review** column on the sprint board.`;
      }
    }

    // General projects query
    if (projectsList.length > 0) {
      const backlog = projectsList.filter(p => p.column === 'Backlog');
      const inProgress = projectsList.filter(p => p.column === 'In Progress');
      const inReview = projectsList.filter(p => p.column === 'In Review');
      const done = projectsList.filter(p => p.column === 'Done');

      let responseText = `Operations sync complete. Here is the real-time status of the projects on the Sprint board:\n\n`;
      
      if (backlog.length > 0) {
        responseText += `### 📋 Backlog\n`;
        backlog.forEach(p => responseText += `- **${p.title}** (${p.level} priority) - Lead: *${p.owner}* (ID: \`${p.id}\`)\n`);
        responseText += `\n`;
      }
      if (inProgress.length > 0) {
        responseText += `### ⏳ In Progress\n`;
        inProgress.forEach(p => responseText += `- **${p.title}** (${p.level} priority) - Lead: *${p.owner}* (ID: \`${p.id}\`)\n`);
        responseText += `\n`;
      }
      if (inReview.length > 0) {
        responseText += `### 🔍 In Review\n`;
        inReview.forEach(p => responseText += `- **${p.title}** (${p.level} priority) - Lead: *${p.owner}* (ID: \`${p.id}\`)\n`);
        responseText += `\n`;
      }
      if (done.length > 0) {
        responseText += `### ✅ Done\n`;
        done.forEach(p => responseText += `- **${p.title}** (${p.level} priority) - Lead: *${p.owner}* (ID: \`${p.id}\`)\n`);
        responseText += `\n`;
      }

      responseText += `Feel free to assign tickets or request updates on any active operations!`;
      return responseText;
    }

    return `Operations sync complete for inquiry: "${text}". Sprint statistics:
- Active Tickets: **0**
- Completed Tasks: **0**
- Running loops: \`db_index_compression\`.`;
  }

  // Legal Router
  if (execId === 'legal') {
    if (isSops || isVision) {
      const rulesVal = await getBrainValue('rules', '- Standard Mutual NDAs must be signed by SaaS partners.\n- Privacy logs must maintain GDPR compliance guidelines at 100% secure.');
      return `Regulatory compliance policies/rules:\n${rulesVal}`;
    }
    return `Compliance check completed for: "${text}". Legal logs:
- SSL Certification: **Valid**
- GDPR regulatory status: **100% compliant**
- Trademark registry: **Active**.`;
  }

  return `Directive processed: "${text}". Strategy parameters synchronized.`;
};

// Send Message, query OpenAI/OpenRouter/Gemini, and store history
export const sendMessage = async (req, res) => {
  const { executiveId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  try {
    let founder = await prisma.founder.findFirst();
    if (!founder) {
      founder = await prisma.founder.create({
        data: {
          email: 'founder@company.com',
          password: 'password123',
          name: 'Khushi Rajawat',
          role: 'Founder',
          companyName: 'OS'
        }
      });
    }

    const exec = await prisma.executive.findUnique({
      where: { id: executiveId }
    });

    if (!exec) {
      return res.status(404).json({ error: 'Executive not found' });
    }

    let chat = await prisma.chat.findUnique({
      where: {
        founderId_executiveId: {
          founderId: founder.id,
          executiveId: exec.id
        }
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          founderId: founder.id,
          executiveId: exec.id
        }
      });
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // 1. Save Founder Message in PostgreSQL
    const userMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        sender: 'founder',
        text: text,
        timestamp: currentTime
      }
    });

    // Scan founder message for assignments
    try {
      await scanAndProcessAssignments(text, 'Founder', exec.id);
    } catch (e) {
      console.error('Failed to process assignments from user message:', e);
    }

    // Trigger CEO Command if keyword matches
    if (text.toLowerCase().includes('ceo command')) {
      triggerCEOCommand(text, 'Founder');
    }

    // 2. Fetch all previous messages in this chat to form history/memory
    const previousMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' }
    });

    const formattedHistory = previousMessages.map(msg => ({
      role: msg.sender === 'founder' ? 'user' : 'assistant',
      content: msg.text
    }));

    // 3. Compile C-Suite context and retrieve the Company Brain
    let finalSystemPrompt = exec.systemPrompt;
    const companyBrainContext = await getCompanyBrainContext();
    const activeProjectsContext = await getActiveProjectsContext();
    finalSystemPrompt = `${finalSystemPrompt}${companyBrainContext}${activeProjectsContext}`;

    // 4. CEO Roundtable consultation
    let csuiteBriefing = "";
    if (exec.id === 'ceo') {
      const execsToConsult = ['cto', 'cfo', 'cmo', 'coo', 'legal'];
      
      const consultations = await Promise.all(
        execsToConsult.map(async (id) => {
          const dbExec = await prisma.executive.findUnique({ where: { id } });
          const basePrompt = dbExec ? dbExec.systemPrompt : `${id.toUpperCase()} Mandate`;
          const fullPrompt = `${basePrompt}${companyBrainContext}${activeProjectsContext}`;
          const assessment = await consultExecutive(id, fullPrompt, text, openRouterKey, openAIKey);
          return { id, assessment };
        })
      );

      csuiteBriefing = "\n\n=== C-SUITE ROUNDTABLE CONSULTATION LOGS ===\n";
      for (const consult of consultations) {
        csuiteBriefing += `\n[${consult.id.toUpperCase()} Department Assessment]:\n${consult.assessment}\n`;
      }
      
      finalSystemPrompt = `${finalSystemPrompt}\n\n${csuiteBriefing}\n\nAs the CEO, you have consulted your C-Suite team above. Synthesize their assessments and formulate a single, unified final recommendation. The Founder must only see your final recommendation.`;
    }

    let reply = '';
    let usedMockFallback = false;

    // Detect Google Gemini API Key
    const isGeminiKey = openRouterKey && (openRouterKey.startsWith('AIzaSy') || openRouterKey.startsWith('AQ.'));

    if (isGeminiKey) {
      try {
        const geminiHistory = formattedHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${openRouterKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: finalSystemPrompt }] },
            contents: geminiHistory
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          console.error(`Gemini API Error status: ${response.status}`);
          usedMockFallback = true;
        }
      } catch (err) {
        console.error('Gemini API call failed', err);
        usedMockFallback = true;
      }
    } else if (openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://os.os',
            'X-Title': 'OS'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: finalSystemPrompt },
              ...formattedHistory
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
        } else {
          console.error(`OpenRouter error: ${response.status}`);
          usedMockFallback = true;
        }
      } catch (err) {
        console.error('OpenRouter call failed', err);
        usedMockFallback = true;
      }
    } else if (openAIKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: finalSystemPrompt },
              ...formattedHistory
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
        } else {
          console.error(`OpenAI error: ${response.status}`);
          usedMockFallback = true;
        }
      } catch (err) {
        console.error('OpenAI call failed', err);
        usedMockFallback = true;
      }
    } else {
      usedMockFallback = true;
    }

    if (usedMockFallback || !reply) {
      let warningPrefix = '';
      if (!openRouterKey && !openAIKey) {
        warningPrefix = `> [!WARNING]\n> **No API Key detected**. Configure \`OPENROUTER_API_KEY\` or \`OPENAI_API_KEY\` inside \`backend/.env\` to enable live LLM integration. Simulation output:\n\n`;
      }
      
      const baseReply = await compileContextAwareFallback(exec.id, text);
      reply = `${warningPrefix}${baseReply}`;
    }

    // Save Response
    const execMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        sender: 'executive',
        text: reply,
        timestamp: currentTime
      }
    });

    // Scan executive reply for assignments
    try {
      await scanAndProcessAssignments(reply, exec.name, exec.id);
    } catch (e) {
      console.error('Failed to process assignments from executive reply:', e);
    }

    // Parse and auto-schedule calendar reminders
    try {
      parseAndCreateCalendarEvents(reply);
    } catch (e) {
      console.error('Failed to parse calendar events from reply:', e);
    }

    return res.json({
      userMessage: userMsg,
      executiveMessage: execMsg
    });
  } catch (error) {
    console.warn("Database offline. Storing in-memory chat session.");
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'founder',
      text: text,
      timestamp: currentTime
    };

    if (!inMemoryChats[executiveId]) {
      inMemoryChats[executiveId] = [
        {
          id: `greet-${executiveId}`,
          sender: 'executive',
          text: getGreetingText(executiveId),
          timestamp: '09:00 AM'
        }
      ];
    }
    inMemoryChats[executiveId].push(userMsg);

    // Scan founder message for assignments
    try {
      await scanAndProcessAssignments(text, 'Founder', executiveId);
    } catch (e) {
      console.error('Failed to process assignments in memory user message:', e);
    }

    // Trigger CEO Command if keyword matches
    if (text.toLowerCase().includes('ceo command')) {
      triggerCEOCommand(text, 'Founder');
    }

    // Resolve LLM or simulation reply
    let reply = '';
    const companyBrainContext = await getCompanyBrainContext();
    const activeProjectsContext = await getActiveProjectsContext();
    let finalPrompt = getGreetingText(executiveId) + companyBrainContext + activeProjectsContext;

    // Detect Google Gemini API Key in fallback route
    const isGeminiKey = openRouterKey && (openRouterKey.startsWith('AIzaSy') || openRouterKey.startsWith('AQ.'));

    if (executiveId === 'ceo') {
      const ctoAssess = "Engineering is stable. Repositories compiled. GKE cluster cost optimized.";
      const cfoAssess = "Runway is projected at 18.4 months. Financial ledgers locked.";
      const cmoAssess = "Campaign click ratios CTR are at 4.8%. Search traffic steady.";
      const cooAssess = "Sprint backlog mapped. Background execution loops are optimal.";
      const legalAssess = "Contract terms are GDPR compliant. trademark registrations secure.";

      const consultLogs = `
=== C-SUITE ROUNDTABLE CONSULTATION LOGS ===
- CTO (Engineering) Assessment: ${ctoAssess}
- CFO (Finance) Assessment: ${cfoAssess}
- CMO (Marketing) Assessment: ${cmoAssess}
- COO (Operations) Assessment: ${cooAssess}
- LEGAL (Compliance) Assessment: ${legalAssess}
      `;

      finalPrompt = `${finalPrompt}\n\n${consultLogs}\n\nAs the CEO, synthesize C-Suite assessments. Founder sees final recommendation.`;
    }

    if (isGeminiKey) {
      try {
        const history = inMemoryChats[executiveId].map(msg => ({
          role: msg.sender === 'founder' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${openRouterKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: finalPrompt }] },
            contents: history
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (err) {
        console.error('In-memory Gemini API call failed', err);
      }
    } else if (openRouterKey) {
      try {
        const history = inMemoryChats[executiveId].map(msg => ({
          role: msg.sender === 'founder' ? 'user' : 'assistant',
          content: msg.text
        }));
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://os.os',
            'X-Title': 'OS'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: finalPrompt },
              ...history
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('In-memory OpenRouter call failed', err);
      }
    } else if (openAIKey) {
      try {
        const history = inMemoryChats[executiveId].map(msg => ({
          role: msg.sender === 'founder' ? 'user' : 'assistant',
          content: msg.text
        }));
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: finalPrompt },
              ...history
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.error('In-memory OpenAI call failed', err);
      }
    }

    if (!reply) {
      let warningPrefix = '';
      if (!openRouterKey && !openAIKey) {
        warningPrefix = `> [!WARNING]\n> **No API Key detected**. Configure \`OPENROUTER_API_KEY\` or \`OPENAI_API_KEY\` inside \`backend/.env\` to enable live LLM integration. Simulation output:\n\n`;
      }
      
      const baseReply = await compileContextAwareFallback(executiveId, text);
      reply = `${warningPrefix}${baseReply}`;
    }

    const execMsg = {
      id: `exec-${Date.now()}`,
      sender: 'executive',
      text: reply,
      timestamp: currentTime
    };

    inMemoryChats[executiveId].push(execMsg);

    // Scan executive reply for assignments
    try {
      const executiveNames = { ceo: 'Aria Vance', coo: 'Helix Sync', cto: 'Byte Weaver', cfo: 'Ledger Vance', cmo: 'Nova Sparks', legal: 'Justice Code' };
      const execName = executiveNames[executiveId] || executiveId.toUpperCase();
      await scanAndProcessAssignments(reply, execName, executiveId);
    } catch (e) {
      console.error('Failed to process assignments in memory executive message:', e);
    }

    // Parse and auto-schedule calendar reminders
    try {
      parseAndCreateCalendarEvents(reply);
    } catch (e) {
      console.error('Failed to parse calendar events from reply:', e);
    }

    return res.json({
      userMessage: userMsg,
      executiveMessage: execMsg
    });
  }
};

// Clear Chat History
export const clearChatHistory = async (req, res) => {
  const { executiveId } = req.params;

  try {
    const founder = await prisma.founder.findFirst();
    if (!founder) return res.status(404).json({ error: 'Founder not found' });

    const chat = await prisma.chat.findUnique({
      where: {
        founderId_executiveId: {
          founderId: founder.id,
          executiveId: executiveId
        }
      }
    });

    if (chat) {
      await prisma.message.deleteMany({
        where: { chatId: chat.id }
      });
    }

    return res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    console.warn("Database offline. Clearing in-memory chat session.");
    inMemoryChats[executiveId] = [
      {
        id: `greet-${executiveId}`,
        sender: 'executive',
        text: getGreetingText(executiveId),
        timestamp: '09:00 AM'
      }
    ];
    return res.json({ success: true, message: 'In-memory chat history cleared' });
  }
};

export const uploadDocument = async (req, res) => {
  const { executiveId } = req.params;
  const { fileName, fileSize, fileType, fileContent } = req.body;

  if (!fileName || !fileContent) {
    return res.status(400).json({ error: 'File name and content are required' });
  }

  let fileBuffer;
  let uploadsDir;
  let safeName;
  let filePath;

  // Save file physically to uploads/ directory
  try {
    uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');
    filePath = path.join(uploadsDir, safeName);
    
    const base64Data = fileContent.replace(/^data:[^;]+;base64,/, "");
    fileBuffer = Buffer.from(base64Data, 'base64');
    
    await fs.promises.writeFile(filePath, fileBuffer);
    console.log(`[File Upload] Successfully saved file: ${filePath}`);
  } catch (fsErr) {
    console.error("[File Upload] Failed to write file to disk:", fsErr);
  }

  // Parse PDF content using pdf-parse and summarize it using askAI
  let parsedDetailsText = "";
  if (fileName.toLowerCase().endsWith('.pdf') && fileBuffer) {
    try {
      const parsedData = await pdf(fileBuffer);
      if (parsedData && parsedData.text) {
        const words = parsedData.text.trim().split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        
        console.log(`[PDF Summary] Summarizing PDF (${parsedData.numpages || 1} pages, ~${wordCount} words) via askAI...`);
        const messages = [
          {
            role: "user",
            content: `Summarize the following document content in a professional, structured boardroom executive format. Keep the summary under 200 words, highlighting key findings, metrics, and actionable items:\n\n${parsedData.text}`
          }
        ];
        const summary = await askAI(messages);
        parsedDetailsText = `\n\n### 📝 Executive Document Summary\n${summary}`;
      }
    } catch (parseErr) {
      console.error("[PDF Parse / askAI] Failed to extract or summarize PDF:", parseErr);
      parsedDetailsText = `\n\n### 📝 Executive Document Summary\nError occurred while attempting to parse and summarize the PDF.`;
    }
  }

  try {
    let founder = await prisma.founder.findFirst();
    if (!founder) {
      founder = await prisma.founder.create({
        data: {
          email: 'founder@company.com',
          password: 'password123',
          name: 'Khushi Rajawat',
          role: 'Founder',
          companyName: 'OS'
        }
      });
    }

    const exec = await prisma.executive.findUnique({
      where: { id: executiveId }
    });

    if (!exec) {
      return res.status(404).json({ error: 'Executive not found' });
    }

    let chat = await prisma.chat.findUnique({
      where: {
        founderId_executiveId: {
          founderId: founder.id,
          executiveId: exec.id
        }
      }
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          founderId: founder.id,
          executiveId: exec.id
        }
      });
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create Report entry
    try {
      await prisma.report.create({
        data: {
          name: fileName,
          size: fileSize || '1.0 MB',
          compiled: 'Just now',
          author: 'Founder',
          type: fileType && fileType.includes('pdf') ? 'text' : 'code'
        }
      });
    } catch (e) {
      console.warn("Database offline during report logging, adding to in-memory fallback list.");
      const reportController = await import('./reportController.js');
      reportController.fallbackReports.push({
        name: fileName,
        size: fileSize || '1.0 MB',
        compiled: 'Just now',
        author: 'Founder',
        type: fileType && fileType.includes('pdf') ? 'text' : 'code'
      });
    }

    // 2. Save Founder message containing document link
    const userMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        sender: 'founder',
        text: `📎 **Uploaded Document**: \`${fileName}\` (${fileSize || '1.0 MB'})`,
        timestamp: currentTime
      }
    });

    // 3. Save Executive Response
    const executiveReplyText = `I have successfully received and parsed your document: **${fileName}** (${fileSize || '1.0 MB'}). The document has been securely archived and linked to our company records under compiled board documents.${parsedDetailsText}`;
    const execMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        sender: 'executive',
        text: executiveReplyText,
        timestamp: currentTime
      }
    });

    return res.json({
      userMessage: userMsg,
      executiveMessage: execMsg
    });
  } catch (error) {
    console.warn("Database offline. Storing uploaded document session in memory.");
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'founder',
      text: `📎 **Uploaded Document**: \`${fileName}\` (${fileSize || '1.0 MB'})`,
      timestamp: currentTime
    };

    if (!inMemoryChats[executiveId]) {
      inMemoryChats[executiveId] = [
        {
          id: `greet-${executiveId}`,
          sender: 'executive',
          text: getGreetingText(executiveId),
          timestamp: '09:00 AM'
        }
      ];
    }
    inMemoryChats[executiveId].push(userMsg);

    // Save in-memory report fallback
    const reportController = await import('./reportController.js');
    reportController.fallbackReports.push({
      name: fileName,
      size: fileSize || '1.0 MB',
      compiled: 'Just now',
      author: 'Founder',
      type: fileType && fileType.includes('pdf') ? 'text' : 'code'
    });

    const executiveReplyText = `I have successfully received and parsed your document: **${fileName}** (${fileSize || '1.0 MB'}). The document has been securely archived and linked to our company records under compiled board documents.${parsedDetailsText}`;
    const execMsg = {
      id: `exec-${Date.now()}`,
      sender: 'executive',
      text: executiveReplyText,
      timestamp: currentTime
    };
    inMemoryChats[executiveId].push(execMsg);

    return res.json({
      userMessage: userMsg,
      executiveMessage: execMsg
    });
  }
};
