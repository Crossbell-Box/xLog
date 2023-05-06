"use client"

import { PropsWithChildren } from "react"

import { DashboardLayout } from "~/components/dashboard/DashboardLayout"

export default function Layout({ children }: PropsWithChildren) {
  return <DashboardLayout title="Dashboard">{children} </DashboardLayout>
}
