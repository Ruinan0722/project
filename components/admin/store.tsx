"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import {
  MOCK_REQUESTS,
  type GeoFormData,
  type NoteItem,
  type RequestRecord,
  type RequestStatus,
} from "@/lib/geo-data"

interface AdminContextValue {
  requests: RequestRecord[]
  getById: (id: string) => RequestRecord | undefined
  updateData: (id: string, data: GeoFormData) => void
  updateStatus: (id: string, status: RequestStatus) => void
  assignOwner: (id: string, owner: string) => void
  addNote: (id: string, content: string, author?: string) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

function nowStr() {
  return new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-")
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RequestRecord[]>(() => MOCK_REQUESTS)

  const getById = (id: string) => requests.find((r) => r.id === id)

  const updateData = (id: string, data: GeoFormData) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, data, updatedAt: nowStr() } : r)))

  const updateStatus = (id: string, status: RequestStatus) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status, updatedAt: nowStr() } : r)))

  const assignOwner = (id: string, owner: string) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, owner, updatedAt: nowStr() } : r)))

  const addNote = (id: string, content: string, author = "当前用户") =>
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              updatedAt: nowStr(),
              notes: [
                ...r.notes,
                { id: `n${Date.now()}`, author, content, createdAt: nowStr() } satisfies NoteItem,
              ],
            }
          : r,
      ),
    )

  return (
    <AdminContext.Provider value={{ requests, getById, updateData, updateStatus, assignOwner, addNote }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider")
  return ctx
}
