import { MentorshipSession } from '@prisma/client'
import { isBefore, subMinutes } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { db } from './db'

export interface ReminderTemplate {
  subject: string
  body: string
}

export const reminderIntervals = {
  '24h': 24 * 60,
  '1h': 60,
  '15m': 15,
} as const

export class ReminderService {
  private async sendEmail(to: string, subject: string, body: string) {
    // Implementation would use email service (e.g., SendGrid, AWS SES)
    console.log(`Sending email to ${to}: ${subject}\n${body}`)
  }

  private getReminderTemplate(
    session: MentorshipSession,
    minutesBefore: number
  ): ReminderTemplate {
    const time = formatInTimeZone(session.startTime, session.timezone, 'PPpp')

    if (minutesBefore === reminderIntervals['24h']) {
      return {
        subject: `Reminder: Mentorship Session Tomorrow`,
        body: `You have a mentorship session "${session.title}" scheduled for tomorrow at ${time}.`,
      }
    }

    if (minutesBefore === reminderIntervals['1h']) {
      return {
        subject: `Reminder: Mentorship Session in 1 Hour`,
        body: `Your mentorship session "${session.title}" starts in 1 hour at ${time}.`,
      }
    }

    return {
      subject: `Reminder: Mentorship Session in 15 Minutes`,
      body: `Your mentorship session "${session.title}" starts in 15 minutes at ${time}.`,
    }
  }

  async sendReminders() {
    const now = new Date()

    // Get all scheduled sessions that haven't started yet
    const upcomingSessions = await db.mentorshipSession.findMany({
      where: {
        status: 'SCHEDULED',
        startTime: {
          gt: now,
        },
      },
      include: {
        student: true,
        mentor: true,
      },
    })

    for (const session of upcomingSessions) {
      const remindersSent = session.remindersSent || []

      // Check each reminder interval
      for (const [, minutes] of Object.entries(reminderIntervals)) {
        const reminderTime = subMinutes(new Date(session.startTime), minutes)

        // If it's time to send this reminder and we haven't sent it yet
        if (
          isBefore(reminderTime, now) &&
          !remindersSent.some(
            (sent) =>
              Math.abs(sent.getTime() - reminderTime.getTime()) < 1000 * 60
          )
        ) {
          const template = this.getReminderTemplate(session, minutes)

          // Send to both student and mentor
          await this.sendEmail(
            session.student.email,
            template.subject,
            template.body
          )
          await this.sendEmail(
            session.mentor.email,
            template.subject,
            template.body
          )

          // Record that we sent this reminder
          await db.mentorshipSession.update({
            where: { id: session.id },
            data: {
              remindersSent: {
                push: now,
              },
            },
          })
        }
      }
    }
  }

  async scheduleReminders() {
    // This would be called by a cron job every few minutes
    await this.sendReminders()
  }
}
