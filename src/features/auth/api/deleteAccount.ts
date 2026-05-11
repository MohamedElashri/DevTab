import { useMutation } from '@tanstack/react-query'

const deleteAccount = async (): Promise<void> => {
  // Auth is disabled in this fork
  return Promise.resolve()
}

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
  })
}
