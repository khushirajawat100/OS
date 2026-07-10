import { prisma } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { extractText } from '../services/pdfService.js';

export let fallbackReports = [
  { name: 'CFO_Q2_Financial_Audit.pdf', size: '2.4 MB', compiled: '2 hours ago', author: 'CFO', type: 'sheet' },
  { name: 'CTO_AWS_Security_Scan.json', size: '148 KB', compiled: '5 hours ago', author: 'CTO', type: 'code' },
  { name: 'CMO_Acquisition_Report_W25.pdf', size: '1.8 MB', compiled: '1 day ago', author: 'CMO', type: 'text' },
  { name: 'Legal_NDA_Audit_Logs.md', size: '42 KB', compiled: '2 days ago', author: 'Legal', type: 'text' },
  { name: 'CEO_Corporate_Objectives_2026.pdf', size: '1.2 MB', compiled: '3 days ago', author: 'CEO', type: 'text' }
];

const generatePDFReport = (safeName, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
  doc.pipe(res);
  
  // Set up header banner
  doc.rect(0, 0, 595.28, 80).fill('#0f172a'); // dark slate banner
  
  doc.fillColor('#ffffff')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('VISUARK OS', 50, 20);
     
  doc.fillColor('#94a3b8')
     .fontSize(10)
     .font('Helvetica')
     .text('Automated Boardroom & Executive Workspace', 50, 48);
     
  // Date and metadata in top right
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  doc.fillColor('#94a3b8')
     .fontSize(8)
     .text(`Compiled: ${dateStr}`, 400, 20, { align: 'right', width: 145 });
  doc.text(`File: ${safeName}`, 400, 35, { align: 'right', width: 145 });
  
  // Document body starting at y=110
  doc.fillColor('#1e293b');
  
  if (safeName === 'CFO_Q2_Financial_Audit.pdf') {
    // CFO Report
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text('CFO Q2 Financial Audit Report', 50, 110);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('Author: CFO (Finance Department)', 50, 130);
    
    // Draw horizontal line
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 145).lineTo(545, 145).stroke();
    
    // Table/Grid of metrics
    let y = 165;
    const metrics = [
      { key: 'Monthly Recurring Revenue (MRR)', val: '$48,250', highlight: true },
      { key: 'Annual Run Rate (ARR)', val: '$579,000', highlight: true },
      { key: 'Total C-Suite Operational Cost', val: '$142/mo', highlight: false },
      { key: 'Tax Reserve Alloc (21%)', val: '$10,132', highlight: false },
      { key: 'Net Corporate Profit Margin', val: '99.7%', highlight: true }
    ];
    
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569');
    doc.text('FINANCIAL PARAMETER', 50, y);
    doc.text('VALUE', 400, y, { align: 'right', width: 145 });
    
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, y + 15).lineTo(545, y + 15).stroke();
    y += 25;
    
    metrics.forEach((m) => {
      doc.font(m.highlight ? 'Helvetica-Bold' : 'Helvetica').fillColor('#1e293b');
      doc.text(m.key, 50, y);
      
      if (m.highlight) {
        doc.fillColor('#10b981'); // Emerald
      }
      doc.text(m.val, 400, y, { align: 'right', width: 145 });
      
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, y + 15).lineTo(545, y + 15).stroke();
      y += 25;
    });
    
    // Summary box
    y += 10;
    doc.rect(50, y, 495, 60).fill('#f8fafc');
    doc.strokeColor('#cbd5e1').lineWidth(1).rect(50, y, 495, 60).stroke();
    
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#334155').text('AUDIT SUMMARY:', 65, y + 12);
    doc.fontSize(9).font('Helvetica').fillColor('#475569')
       .text('Financial parameters verify runway exceeds 18 months under current C-suite resource consumption. Automated tax reserves are running at optimal rates.', 65, y + 25, { width: 465 });
       
  } else if (safeName === 'CMO_Acquisition_Report_W25.pdf') {
    // CMO Report
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text('CMO Customer Acquisition Report (W25)', 50, 110);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('Author: CMO (Marketing)', 50, 130);
    
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 145).lineTo(545, 145).stroke();
    
    // Summary metrics boxes (Ad Spend, Avg CAC, Click-through)
    let y = 165;
    
    doc.rect(50, y, 150, 60).fill('#f8fafc');
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(50, y, 150, 60).stroke();
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('AD SPEND', 60, y + 12);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text('$2,450', 60, y + 28);
    
    doc.rect(222, y, 150, 60).fill('#f8fafc');
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(222, y, 150, 60).stroke();
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('AVG CAC', 232, y + 12);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#10b981').text('$1.42', 232, y + 28);
    
    doc.rect(395, y, 150, 60).fill('#f8fafc');
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(395, y, 150, 60).stroke();
    doc.fontSize(9).font('Helvetica').fillColor('#64748b').text('CLICK-THROUGH', 405, y + 12);
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text('4.82%', 405, y + 28);
    
    y += 90;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('Campaign & Traffic Breakdowns', 50, y);
    
    y += 20;
    const campaigns = [
      { name: 'Campaign Gamma (Google Ads)', status: '+14% Growth', desc: 'Accelerated acquisition targeting autonomous business applications.' },
      { name: 'Campaign Beta (X Campaign)', status: 'Budget Shifted', desc: 'Unused budget shifted to Google Ads due to low click conversion.' },
      { name: 'Organic Traffic Conversion', status: '+4.2% Reach', desc: 'SEO rank adjustments driving consistent organic inbound signups.' }
    ];
    
    campaigns.forEach((c) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(c.name, 50, y);
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#0284c7').text(c.status, 400, y, { align: 'right', width: 145 });
      y += 15;
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(c.desc, 50, y, { width: 495 });
      y += 25;
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke();
      y += 15;
    });
    
  } else if (safeName === 'GDPR_Compliance_Scan.pdf') {
    // GDPR Report
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text('GDPR Regulatory Compliance Report', 50, 110);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('Author: Legal Counsel', 50, 130);
    
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 145).lineTo(545, 145).stroke();
    
    let y = 165;
    const rules = [
      { name: 'User Data Cookie Policies', status: '100% Compliant', desc: 'Opt-in/opt-out mechanics verified for all C-Suite endpoints.' },
      { name: 'System Encryption (TLS 1.3)', status: 'Secure', desc: 'Secure transit channels enforced with current modern SSL handshakes.' },
      { name: 'IP Domain Registrations', status: 'Active', desc: 'All corporate properties and domain mappings registered and up to date.' },
      { name: 'GDPR Data Processing Agreement', status: 'Verified', desc: 'Data control contracts signed off for LLM processing nodes.' }
    ];
    
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569');
    doc.text('COMPLIANCE REGISTER', 50, y);
    doc.text('EVALUATION STATUS', 400, y, { align: 'right', width: 145 });
    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(50, y + 15).lineTo(545, y + 15).stroke();
    y += 25;
    
    rules.forEach((r) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(r.name, 50, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#10b981').text(r.status, 400, y, { align: 'right', width: 145 });
      y += 15;
      doc.fontSize(9).font('Helvetica').fillColor('#64748b').text(r.desc, 50, y, { width: 495 });
      y += 20;
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke();
      y += 15;
    });
    
  } else if (safeName === 'CEO_Corporate_Objectives_2026.pdf') {
    // CEO Report
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text('CEO Corporate Strategy Objectives 2026', 50, 110);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('Author: CEO (Corporate)', 50, 130);
    
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 145).lineTo(545, 145).stroke();
    
    let y = 165;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0f172a').text('ENTERPRISE ROADMAP OBJECTIVES', 50, y);
    y += 25;
    
    const objectives = [
      { title: 'Operational Leverage (100%)', desc: 'Achieve complete operational leverage using fully synced LLM workflows, connecting agents to auto-execute backend triggers and coordinate reports.' },
      { title: 'Extended Runway (18+ Months)', desc: 'Establish corporate cash-flow runway exceeding 18 months by eliminating manual overhead and automating repetitive backend/frontend support layers.' },
      { title: 'Cloud Workload Optimization', desc: 'Optimize production cloud workloads. CTO is targeting database index log reductions, schema normalization, and microservice compute reductions.' }
    ];
    
    objectives.forEach((obj, idx) => {
      // Draw bullet circle
      doc.circle(55, y + 5, 4).fill('#0284c7');
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(obj.title, 70, y);
      y += 15;
      doc.fontSize(9).font('Helvetica').fillColor('#475569').text(obj.desc, 70, y, { width: 475 });
      y += 35;
    });
    
  } else {
    // Generic Report PDF for any other custom files
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0284c7').text(`Corporate Brief: ${safeName.replace('.pdf', '')}`, 50, 110);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748b').text('Author: Boardroom System', 50, 130);
    
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 145).lineTo(545, 145).stroke();
    
    let y = 165;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text('Document Overview', 50, y);
    y += 20;
    doc.fontSize(9).font('Helvetica').fillColor('#475569').text(`This document represents the automated export compilation of ${safeName}. It was successfully compiled by the Visuark OS corporate suite.`, 50, y, { width: 495 });
    
    y += 40;
    doc.rect(50, y, 495, 45).fill('#f8fafc');
    doc.strokeColor('#e2e8f0').lineWidth(1).rect(50, y, 495, 45).stroke();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('VERIFICATION SIGNATURE:', 65, y + 10);
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748b').text('Visuark OS - Automated C-Suite Execution Node', 65, y + 25);
  }
  
  // Draw footer
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 750).lineTo(545, 750).stroke();
  doc.fontSize(8).font('Helvetica').fillColor('#94a3b8').text('Visuark OS Boardroom Dashboard © 2026. All rights reserved.', 50, 760);
  doc.text('Page 1 of 1', 400, 760, { align: 'right', width: 145 });
  
  doc.end();
};

export const getReports = async (req, res) => {
  try {
    const reports = await prisma.report.findMany();
    res.json(reports);
  } catch (error) {
    console.warn("Database offline. Resolving local fallback reports archives.");
    res.json(fallbackReports);
  }
};

export const downloadReport = async (req, res) => {
  const { fileName } = req.params;
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');
  
  const filePath = path.join(process.cwd(), 'uploads', safeName);
  if (fs.existsSync(filePath)) {
    if (safeName.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (safeName.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (safeName.endsWith('.md')) {
      res.setHeader('Content-Type', 'text/markdown');
    } else if (safeName.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    return res.sendFile(filePath);
  }
  
  if (safeName.endsWith('.pdf')) {
    generatePDFReport(safeName, res);
  } else if (safeName.endsWith('.json')) {
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', 'application/json');
    res.json({
      reportName: safeName,
      status: "Verified",
      timestamp: new Date().toISOString(),
      details: "AWS Security Scan complete. 0 critical vulnerabilities found."
    });
  } else if (safeName.endsWith('.md')) {
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', 'text/markdown');
    res.send(`# NDA Audit Logs: ${safeName}\n\nAll NDA checks verified and matched against active system logs.`);
  } else {
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(`File data for ${safeName}`);
  }
};

export const getReportContent = async (req, res) => {
  const { fileName } = req.params;
  const safeName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '');
  const filePath = path.join(process.cwd(), 'uploads', safeName);
  
  if (fs.existsSync(filePath)) {
    try {
      if (safeName.endsWith('.pdf')) {
        const fileBuffer = fs.readFileSync(filePath);
        const parsed = await extractText(fileBuffer);
        return res.json({
          success: true,
          type: 'PDF Document',
          content: parsed.text || 'Empty PDF file.'
        });
      } else if (safeName.endsWith('.json')) {
        const fileText = fs.readFileSync(filePath, 'utf8');
        try {
          const jsonVal = JSON.parse(fileText);
          return res.json({
            success: true,
            type: 'JSON Data',
            content: JSON.stringify(jsonVal, null, 2)
          });
        } catch {
          return res.json({
            success: true,
            type: 'JSON Data',
            content: fileText
          });
        }
      } else {
        const fileText = fs.readFileSync(filePath, 'utf8');
        return res.json({
          success: true,
          type: safeName.endsWith('.csv') ? 'CSV Spreadsheet' : (safeName.endsWith('.md') ? 'Markdown Document' : 'Plain Text'),
          content: fileText
        });
      }
    } catch (err) {
      console.error("[Report Content API] Error reading file:", err);
      return res.status(500).json({ error: 'Failed to read file content' });
    }
  }
  
  if (safeName.endsWith('.pdf')) {
    let contentText = "Automated Boardroom Report: " + safeName;
    if (safeName === 'CFO_Q2_Financial_Audit.pdf') {
      contentText = `Monthly Recurring Revenue (MRR): $48,250\nAnnual Run Rate (ARR): $579,000\nTotal C-Suite Operational Cost: $142/mo\nTax Reserve Alloc (21%): $10,132\nNet Corporate Profit Margin: 99.7%\n\n*AUDIT SUMMARY*: Financial parameters verify runway exceeds 18 months under current C-suite resource consumption. Automated tax reserves are running at optimal rates.`;
    } else if (safeName === 'CMO_Acquisition_Report_W25.pdf') {
      contentText = `Ad Spend: $2,450\nAvg CAC: $1.42\nClick-Through: 4.82%\n\nCampaign & Traffic Breakdowns:\n- Campaign Gamma (Google Ads): +14% Growth\n- Campaign Beta (X Campaign): Unused Budget Shifted\n- Organic Traffic Conversion: +4.2% Reach`;
    } else if (safeName === 'GDPR_Compliance_Scan.pdf') {
      contentText = `Compliance Register / Evaluation Status:\n- User Data Cookie Policies: 100% Compliant\n- System Encryption (TLS 1.3): Secure\n- IP Domain Registrations: Active\n- GDPR Data Processing Agreement: Verified`;
    } else if (safeName === 'CEO_Corporate_Objectives_2026.pdf') {
      contentText = `ENTERPRISE ROADMAP OBJECTIVES:\n- Achieve 100% operational leverage using fully synced LLM workflows.\n- Establish cash-flow runway exceeding 18 months with $0 manual labor cost.\n- Optimize production cloud workloads (CTO targeting database index log reductions).`;
    }
    return res.json({
      success: true,
      type: 'Financial Statement (PDF)',
      content: contentText
    });
  } else if (safeName.endsWith('.json')) {
    return res.json({
      success: true,
      type: 'Security Registry (JSON)',
      content: JSON.stringify({
        scan_status: "COMPLETED",
        security_cohesion: 1.0,
        gke_nodes: {
          compute_cluster: "os-core-prod",
          region: "us-east1",
          nodes_active: 3,
          utilization: "82.4%"
        },
        dependencies: {
          vulnerabilities: 0,
          packages_checked: 126
        },
        compliance: {
          soc2: "verified",
          ssl_handshake: "optimal"
        }
      }, null, 2)
    });
  } else if (safeName.endsWith('.csv')) {
    return res.json({
      success: true,
      type: 'CSV Spreadsheet',
      content: `Parameter,Value,Status\nOperational Leverage,100%,Optimal\nRunway,18 Months,Secure\nCloud Workloads,Active,Optimized`
    });
  } else if (safeName.endsWith('.md')) {
    return res.json({
      success: true,
      type: 'Contract Template (Markdown)',
      content: `# MUTUAL NON-DISCLOSURE CONTRACT\n\nThis Non-Disclosure Agreement is entered into by and between the **Founder of OS** and the authorizing SaaS Integration Partner.\n\n**1. PURPOSE:** The parties wish to evaluate a technical integration between their systems.\n\n**2. CONFIDENTIAL INFORMATION:** Includes all code blocks, database keys, customer parameters.\n\n**3. STANDARDS:** Information must be kept secure.`
    });
  }
  
  return res.status(404).json({ error: 'Report not found' });
};


