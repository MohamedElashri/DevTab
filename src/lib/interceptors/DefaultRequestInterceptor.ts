import { InternalAxiosRequestConfig } from 'axios'

export async function DefaultRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config) {
    if (config.headers) {
      config.headers.Accept = 'application/json'
    }
  }

  return config
}
