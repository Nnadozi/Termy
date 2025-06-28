# Termy Notification System

## Overview
The Termy app includes a comprehensive push notification system to help users maintain their daily word learning habits. The system provides daily word reminders and streak maintenance notifications.

## Features

### 1. Daily Word Notifications
- **Purpose**: Remind users when new daily words are available
- **Timing**: User-configurable time (24-hour format)
- **Content**: "📚 Your Daily Words Are Ready! Time to expand your vocabulary with today's new words."
- **Behavior**: Repeats daily at the specified time

### 2. Streak Reminder Notifications
- **Purpose**: Encourage users to maintain their learning streak
- **Timing**: 2 hours before next batch
- **Content**: "🔥 Don't Break Your Streak! Complete today's words to keep your learning streak alive."
- **Behavior**: Shows 2 hours before next batch if daily words not yet finished

### 3. Test Notifications
- **Purpose**: Allow users to test their notification settings
- **Content**: "📚 Test Notification - This is a test notification from Termy!"
- **Behavior**: Sent immediately when requested

## User Experience

### Onboarding
1. Users can enable notifications during the onboarding process
2. They can set their preferred notification time (HH:MM format)
3. Permission requests are handled automatically

### Settings
1. **Enable/Disable**: Toggle notifications on/off
2. **Time Configuration**: Change notification time with real-time validation
3. **Test Functionality**: Send test notifications to verify settings
4. **Visual Feedback**: Clear status indicators and confirmation messages

### Notification Interaction
- Tapping any notification navigates to the Daily screen
- Notifications work in both foreground and background states
- Proper permission handling for iOS and Android

### Key Components

#### 1. NotificationService (`utils/notificationService.ts`)
- Singleton service for managing all notification operations
- Handles permission requests, scheduling, and cancellation
- Provides methods for immediate and scheduled notifications

#### 2. User Store Integration (`stores/userStore.tsx`)
- Stores notification preferences (`notificationsEnabled`, `dailyWordNotificationTime`)
- Automatically updates notification schedules when preferences change
- Persists settings across app sessions

#### 3. UI Components
- **NotificationsSetup**: Onboarding screen for initial setup
- **NotificationSettings**: Comprehensive settings management
- **useNotificationNavigation**: Hook for handling notification taps

# Termy Premium Subscription
