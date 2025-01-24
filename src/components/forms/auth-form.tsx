'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  loginSchema,
  studentRegistrationSchema,
  alumniRegistrationSchema,
} from '@/lib/validations/auth'
import type {
  AuthForm,
  StudentRegistrationForm,
  AlumniRegistrationForm,
} from '@/types'

interface Props {
  type: 'login' | 'register'
  onSubmit: (
    data: AuthForm | StudentRegistrationForm | AlumniRegistrationForm
  ) => void
}

export function AuthForm({ type, onSubmit }: Props) {
  const [role, setRole] = useState<UserRole | undefined>(undefined)

  const form = useForm<
    | z.infer<typeof loginSchema>
    | z.infer<typeof studentRegistrationSchema>
    | z.infer<typeof alumniRegistrationSchema>
  >({
    resolver: zodResolver(
      type === 'login'
        ? loginSchema
        : role === UserRole.STUDENT
          ? studentRegistrationSchema
          : alumniRegistrationSchema
    ),
    defaultValues: {
      email: '',
      password: '',
      ...(type === 'register' && {
        name: '',
      }),
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-medium">Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  className="h-9 px-3 py-1 text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  className="h-9 px-3 py-1 text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {type === 'register' && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your name"
                      {...field}
                      className="h-9 px-3 py-1 text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium">I am a</FormLabel>
                  <Select
                    onValueChange={(value: UserRole) => {
                      field.onChange(value)
                      setRole(value)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.STUDENT} className="text-sm">
                        Student
                      </SelectItem>
                      <SelectItem value={UserRole.ALUMNI} className="text-sm">
                        Alumni
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {role === UserRole.STUDENT && (
              <>
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Grade Level
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={9}
                          max={12}
                          placeholder="Enter your grade (9-12)"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        School Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your school name"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Interests (comma-separated)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Science, Technology, Arts"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(',').map((i) => i.trim())
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </>
            )}

            {role === UserRole.ALUMNI && (
              <>
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Profession
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your profession"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Company
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Graduation Year
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1900}
                          max={new Date().getFullYear()}
                          placeholder="Enter graduation year"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium">
                        Areas of Expertise (comma-separated)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Engineering, Business, Medicine"
                          className="h-9 px-3 py-1 text-sm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.split(',').map((i) => i.trim())
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </>
            )}

            {(role === UserRole.STUDENT || role === UserRole.ALUMNI) && (
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm font-medium">
                      Bio (optional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] resize-none px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        <Button type="submit" className="mt-2 w-full">
          {type === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  )
}
