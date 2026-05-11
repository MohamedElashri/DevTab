import { useMutation } from '@tanstack/react-query'

const getOauthLink = async (): Promise<{ authLink: string }> => {
  return { authLink: '#' }
}

export const useGetOauthLink = () => {
  return useMutation({
    mutationFn: getOauthLink,
  })
}
