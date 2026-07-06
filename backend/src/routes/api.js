import express from 'express';
import { getExecutives } from '../controllers/executiveController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { getProjects, updateProjectColumn } from '../controllers/projectController.js';
import { getReports, downloadReport, getReportContent } from '../controllers/reportController.js';
import { getChatHistory, sendMessage, clearChatHistory, uploadDocument } from '../controllers/chatController.js';
import { getCalendar, addCalendarEvent, syncCalendarDay } from '../controllers/calendarController.js';

const router = express.Router();

router.get('/executives', getExecutives);
router.get('/dashboard', getDashboardStats);
router.get('/projects', getProjects);
router.put('/projects/:id/column', updateProjectColumn);
router.get('/reports', getReports);
router.get('/reports/:fileName/download', downloadReport);
router.get('/reports/:fileName/content', getReportContent);

router.get('/calendar', getCalendar);
router.post('/calendar', addCalendarEvent);
router.post('/calendar/sync', syncCalendarDay);

router.get('/chat/:executiveId', getChatHistory);
router.post('/chat/:executiveId/upload', uploadDocument);
router.post('/chat/:executiveId', sendMessage);
router.delete('/chat/:executiveId', clearChatHistory);

export default router;
