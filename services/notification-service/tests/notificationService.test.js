"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = require("../src/services/notificationService");
const Notification_1 = require("../src/models/Notification");
jest.mock('../src/models/Notification');
jest.mock('../src/email/mailer');
const mailer_1 = require("../src/email/mailer");
describe('NotificationService', () => {
    let notificationService;
    beforeEach(() => {
        notificationService = new notificationService_1.NotificationService();
        jest.clearAllMocks();
    });
    describe('createNotification', () => {
        it('should create a new notification', async () => {
            const mockNotification = {
                _id: '1',
                userId: 'user1',
                type: 'match_start',
                title: 'Match Starting',
                message: 'Your match is about to start',
                data: { matchId: 'match1' },
                read: false,
                priority: 'normal',
                createdAt: new Date()
            };
            Notification_1.Notification.create = jest.fn().mockResolvedValue(mockNotification);
            const result = await notificationService.createNotification('user1', 'match_start', 'Match Starting', 'Your match is about to start', { matchId: 'match1' });
            expect(Notification_1.Notification.create).toHaveBeenCalled();
            expect(result.userId).toBe('user1');
            expect(result.type).toBe('match_start');
            expect(result.read).toBe(false);
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.createNotification('', 'match_start', 'Title', 'Message')).rejects.toThrow('User ID is required');
        });
        it('should throw error when type is missing', async () => {
            await expect(notificationService.createNotification('user1', '', 'Title', 'Message')).rejects.toThrow('Notification type is required');
        });
        it('should throw error when title is missing', async () => {
            await expect(notificationService.createNotification('user1', 'match_start', '', 'Message')).rejects.toThrow('Title is required');
        });
        it('should throw error when message is missing', async () => {
            await expect(notificationService.createNotification('user1', 'match_start', 'Title', '')).rejects.toThrow('Message is required');
        });
        it('should throw error when database creation fails', async () => {
            Notification_1.Notification.create = jest.fn().mockRejectedValue(new Error('Database error'));
            await expect(notificationService.createNotification('user1', 'match_start', 'Title', 'Message')).rejects.toThrow('Failed to create notification');
        });
    });
    describe('getUserNotifications', () => {
        it('should return all notifications for a user', async () => {
            const mockNotifications = [
                { _id: '1', userId: 'user1', read: false },
                { _id: '2', userId: 'user1', read: false }
            ];
            Notification_1.Notification.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockNotifications)
                })
            });
            const result = await notificationService.getUserNotifications('user1');
            expect(Notification_1.Notification.find).toHaveBeenCalledWith({ userId: 'user1' });
            expect(result).toHaveLength(2);
        });
        it('should return only unread notifications when unreadOnly is true', async () => {
            const mockNotifications = [
                { _id: '1', userId: 'user1', read: false }
            ];
            Notification_1.Notification.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockNotifications)
                })
            });
            const result = await notificationService.getUserNotifications('user1', true);
            expect(Notification_1.Notification.find).toHaveBeenCalledWith({ userId: 'user1', read: false });
            expect(result).toHaveLength(1);
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.getUserNotifications('')).rejects.toThrow('User ID is required');
        });
        it('should throw error when database query fails', async () => {
            Notification_1.Notification.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    exec: jest.fn().mockRejectedValue(new Error('Database error'))
                })
            });
            await expect(notificationService.getUserNotifications('user1')).rejects.toThrow('Failed to fetch notifications');
        });
    });
    describe('markAsRead', () => {
        const mockNotification = {
            _id: '1',
            userId: 'user1',
            read: false,
            save: jest.fn().mockResolvedValue(true)
        };
        it('should mark notification as read', async () => {
            Notification_1.Notification.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockNotification)
            });
            const result = await notificationService.markAsRead('1', 'user1');
            expect(Notification_1.Notification.findById).toHaveBeenCalledWith('1');
            expect(mockNotification.read).toBe(true);
            expect(mockNotification.save).toHaveBeenCalled();
        });
        it('should throw error when notification not found', async () => {
            Notification_1.Notification.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            await expect(notificationService.markAsRead('999', 'user1')).rejects.toThrow('Notification not found');
        });
        it('should throw error when notification belongs to different user', async () => {
            const wrongUserNotification = {
                _id: '1',
                userId: 'user2',
                read: false,
                save: jest.fn()
            };
            Notification_1.Notification.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(wrongUserNotification)
            });
            await expect(notificationService.markAsRead('1', 'user1')).rejects.toThrow('Unauthorized');
        });
        it('should throw error when notificationId is missing', async () => {
            await expect(notificationService.markAsRead('', 'user1')).rejects.toThrow('Notification ID is required');
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.markAsRead('1', '')).rejects.toThrow('User ID is required');
        });
        it('should throw error when database operation fails', async () => {
            Notification_1.Notification.findById = jest.fn().mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Database error'))
            });
            await expect(notificationService.markAsRead('1', 'user1')).rejects.toThrow('Failed to mark notification as read');
        });
    });
    describe('markAllAsRead', () => {
        it('should mark all notifications as read for a user', async () => {
            Notification_1.Notification.updateMany = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ modifiedCount: 5 })
            });
            const result = await notificationService.markAllAsRead('user1');
            expect(Notification_1.Notification.updateMany).toHaveBeenCalledWith({ userId: 'user1', read: false }, { read: true });
            expect(result.modifiedCount).toBe(5);
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.markAllAsRead('')).rejects.toThrow('User ID is required');
        });
        it('should throw error when database operation fails', async () => {
            Notification_1.Notification.updateMany = jest.fn().mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Database error'))
            });
            await expect(notificationService.markAllAsRead('user1')).rejects.toThrow('Failed to mark all notifications as read');
        });
    });
    describe('deleteNotification', () => {
        it('should delete a notification', async () => {
            const mockNotification = {
                _id: '1',
                userId: 'user1'
            };
            Notification_1.Notification.findByIdAndDelete = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockNotification)
            });
            const result = await notificationService.deleteNotification('1', 'user1');
            expect(Notification_1.Notification.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockNotification);
        });
        it('should return null when notification not found', async () => {
            Notification_1.Notification.findByIdAndDelete = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null)
            });
            const result = await notificationService.deleteNotification('999', 'user1');
            expect(result).toBeNull();
        });
        it('should throw error when notificationId is missing', async () => {
            await expect(notificationService.deleteNotification('', 'user1')).rejects.toThrow('Notification ID is required');
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.deleteNotification('1', '')).rejects.toThrow('User ID is required');
        });
        it('should throw error when database operation fails', async () => {
            Notification_1.Notification.findByIdAndDelete = jest.fn().mockReturnValue({
                exec: jest.fn().mockRejectedValue(new Error('Database error'))
            });
            await expect(notificationService.deleteNotification('1', 'user1')).rejects.toThrow('Failed to delete notification');
        });
    });
    describe('sendEmailNotification', () => {
        it('should send email notification', async () => {
            mailer_1.sendEmail.mockResolvedValue({ success: true, messageId: 'msg1' });
            const result = await notificationService.sendEmailNotification('user1', 'Test Subject', 'Test Body');
            expect(mailer_1.sendEmail).toHaveBeenCalledWith('user1', 'Test Subject', 'Test Body');
            expect(result).toEqual({ success: true, messageId: 'msg1' });
        });
        it('should throw error when userId is missing', async () => {
            await expect(notificationService.sendEmailNotification('', 'Subject', 'Body')).rejects.toThrow('User ID is required');
        });
        it('should throw error when subject is missing', async () => {
            await expect(notificationService.sendEmailNotification('user1', '', 'Body')).rejects.toThrow('Subject is required');
        });
        it('should throw error when body is missing', async () => {
            await expect(notificationService.sendEmailNotification('user1', 'Subject', '')).rejects.toThrow('Body is required');
        });
        it('should throw error when email sending fails', async () => {
            mailer_1.sendEmail.mockRejectedValue(new Error('Email error'));
            await expect(notificationService.sendEmailNotification('user1', 'Subject', 'Body')).rejects.toThrow('Failed to send email notification');
        });
    });
    describe('batchCreateNotifications', () => {
        it('should create notifications for multiple users', async () => {
            const mockNotifications = [
                { _id: '1', userId: 'user1', type: 'match_start' },
                { _id: '2', userId: 'user2', type: 'match_start' }
            ];
            Notification_1.Notification.insertMany = jest.fn().mockResolvedValue(mockNotifications);
            const result = await notificationService.batchCreateNotifications(['user1', 'user2'], 'match_start', 'Match Starting', 'Your match is about to start');
            expect(Notification_1.Notification.insertMany).toHaveBeenCalled();
            expect(result).toHaveLength(2);
        });
        it('should throw error when userIds is empty', async () => {
            await expect(notificationService.batchCreateNotifications([], 'match_start', 'Title', 'Message')).rejects.toThrow('User IDs array is required');
        });
        it('should throw error when type is missing', async () => {
            await expect(notificationService.batchCreateNotifications(['user1'], '', 'Title', 'Message')).rejects.toThrow('Notification type is required');
        });
        it('should throw error when title is missing', async () => {
            await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', '', 'Message')).rejects.toThrow('Title is required');
        });
        it('should throw error when message is missing', async () => {
            await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', 'Title', '')).rejects.toThrow('Message is required');
        });
        it('should throw error when database operation fails', async () => {
            Notification_1.Notification.insertMany = jest.fn().mockRejectedValue(new Error('Database error'));
            await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', 'Title', 'Message')).rejects.toThrow('Failed to create batch notifications');
        });
    });
});
