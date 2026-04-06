'use client'

import { ToastContainer, type ToastContainerProps } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ToastWrapper(props: ToastContainerProps) {
  return <ToastContainer {...props} />
}
