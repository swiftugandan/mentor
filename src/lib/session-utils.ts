/* eslint-disable @typescript-eslint/no-explicit-any */
import { addMinutes, isBefore, isAfter, parseISO } from 'date-fns'
import { toZonedTime, formatInTimeZone } from 'date-fns-tz'
import { MentorshipSession, Prisma } from '@prisma/client'

export const MIN_DURATION = 30 // minutes
export const MAX_DURATION = 180 // minutes
export const BUFFER_TIME = 15 // minutes between sessions
export const MAX_FUTURE_DAYS = 90 // maximum days in advance for scheduling
export const REMINDER_INTERVALS = [24 * 60, 60, 15] // minutes before session

type TimeValidationError =
  | 'PAST_DATE'
  | 'TOO_FAR_FUTURE'
  | 'INVALID_DURATION'
  | 'SCHEDULING_CONFLICT'

interface TimeValidationResult {
  isValid: boolean
  error?: TimeValidationError
  message?: string
}

export function validateSessionTime(
  startTime: Date,
  endTime: Date,
  timezone: string = 'UTC'
): TimeValidationResult {
  const now = new Date()
  const maxFutureDate = addMinutes(now, MAX_FUTURE_DAYS * 24 * 60)
  const zonedStartTime = toZonedTime(startTime, timezone)
  const zonedEndTime = toZonedTime(endTime, timezone)

  if (isBefore(zonedStartTime, now)) {
    return {
      isValid: false,
      error: 'PAST_DATE',
      message: 'Session cannot be scheduled in the past',
    }
  }

  if (isAfter(zonedStartTime, maxFutureDate)) {
    return {
      isValid: false,
      error: 'TOO_FAR_FUTURE',
      message: `Sessions can only be scheduled up to ${MAX_FUTURE_DAYS} days in advance`,
    }
  }

  const duration =
    (zonedEndTime.getTime() - zonedStartTime.getTime()) / (1000 * 60)
  if (duration < MIN_DURATION || duration > MAX_DURATION) {
    return {
      isValid: false,
      error: 'INVALID_DURATION',
      message: `Session duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes`,
    }
  }

  return { isValid: true }
}

export function convertTimezone(
  date: Date | string,
  fromTimezone: string,
  toTimezone: string
): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatInTimeZone(parsedDate, toTimezone, "yyyy-MM-dd'T'HH:mm:ssXXX")
}

export function createSessionUpdateData(
  body: any,
  session: MentorshipSession,
  userId: string
): Prisma.MentorshipSessionUpdateInput {
  return {
    ...body,
    lastModifiedBy: userId,
    ...(body.status === 'COMPLETED'
      ? {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      : {}),
    ...(body.status === 'CANCELLED'
      ? {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        }
      : {}),
  }
}
