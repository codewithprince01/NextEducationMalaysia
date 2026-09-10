import Swal from 'sweetalert2';

/**
 * Standard SweetAlert2 confirmation dialog for Delete actions across all admin modules.
 */
export async function confirmDelete(title = 'Are you sure?', text = 'This action cannot be undone.'): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48', // Tailwind rose-600
    cancelButtonColor: '#64748b',  // Tailwind slate-500
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'rounded-2xl font-sans',
      confirmButton: 'px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-600/20',
      cancelButton: 'px-4 py-2 rounded-xl text-xs font-bold',
    },
  });

  return result.isConfirmed;
}

export default Swal;
