import { MentorshipSession, User } from "@prisma/client"
import { formatInTimeZone } from "date-fns-tz"

interface EmailTemplate {
  subject: string
  body: string
}

type NotificationType = 
  | "SESSION_SCHEDULED"
  | "SESSION_UPDATED"
  | "SESSION_CANCELLED"
  | "SESSION_COMPLETED"
  | "SESSION_REMINDER"
  | "FEEDBACK_RECEIVED"

export class NotificationService {
  private async sendEmail(to: string, template: EmailTemplate) {
    // Implementation would use email service (e.g., SendGrid, AWS SES)
    console.log(`Sending email to ${to}:`, template)
  }

  private getSessionTimeString(session: MentorshipSession, userTimezone: string): string {
    return formatInTimeZone(session.startTime, userTimezone, "PPpp")
  }

  private getTemplate(
    type: NotificationType,
    session: MentorshipSession,
    user: User,
    userTimezone: string
  ): EmailTemplate {
    const time = this.getSessionTimeString(session, userTimezone)
    
    switch (type) {
      case "SESSION_SCHEDULED":
        return {
          subject: "New Mentorship Session Scheduled",
          body: `Your mentorship session "${session.title}" has been scheduled for ${time}.`
        }
      
      case "SESSION_UPDATED":
        return {
          subject: "Mentorship Session Updated",
          body: `Your mentorship session "${session.title}" has been updated. New time: ${time}.`
        }
      
      case "SESSION_CANCELLED":
        return {
          subject: "Mentorship Session Cancelled",
          body: `Your mentorship session "${session.title}" scheduled for ${time} has been cancelled.`
        }
      
      case "SESSION_COMPLETED":
        return {
          subject: "Mentorship Session Completed",
          body: `Your mentorship session "${session.title}" has been marked as completed. Please provide your feedback.`
        }
      
      case "SESSION_REMINDER":
        return {
          subject: "Upcoming Mentorship Session Reminder",
          body: `Reminder: Your mentorship session "${session.title}" is scheduled for ${time}.`
        }
      
      case "FEEDBACK_RECEIVED":
        return {
          subject: "New Feedback Received",
          body: `New feedback has been received for your session "${session.title}".`
        }
      
      default:
        throw new Error(`Unknown notification type: ${type}`)
    }
  }

  async notifySessionParticipants(
    type: NotificationType,
    session: MentorshipSession & {
      student: User
      mentor: User
    },
    excludeUser?: string
  ) {
    const participants = [
      {
        user: session.student,
        timezone: session.timezone // Using student's timezone from session
      },
      {
        user: session.mentor,
        timezone: session.timezone // TODO: Get mentor's preferred timezone
      }
    ]

    for (const { user, timezone } of participants) {
      if (user.id === excludeUser) continue
      
      const template = this.getTemplate(type, session, user, timezone)
      await this.sendEmail(user.email, template)
    }
  }

  async sendSessionReminders(session: MentorshipSession & {
    student: User
    mentor: User
  }) {
    await this.notifySessionParticipants("SESSION_REMINDER", session)
  }

  async notifyFeedbackReceived(session: MentorshipSession & {
    student: User
    mentor: User
  }, fromUserId: string) {
    // Only notify the other participant
    await this.notifySessionParticipants("FEEDBACK_RECEIVED", session, fromUserId)
  }
} 