'use client'
import { ReactNode, useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer position="bottom-right" />
    </>
  )
}