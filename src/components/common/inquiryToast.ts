import { toast } from 'react-toastify'

export const INQUIRY_SUCCESS_MESSAGE =
  'Your inquiry has been submitted successfully. We will contact you soon.'

export function showInquirySuccessToast(message?: string) {
  toast.success(message?.trim() || INQUIRY_SUCCESS_MESSAGE)
}

