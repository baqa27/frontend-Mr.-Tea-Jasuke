import { QueryClient } from "@tanstack/react-query"
import { toApiError } from "@/lib/api-error"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: (count, err) => {
        const e = toApiError(err)
        if ([400, 401, 403, 404, 409, 429].includes(e.status)) return false
        return count < 2
      },
      retryDelay: (n) => Math.min(1000 * 2 ** n, 8000),
    },
    mutations: { retry: false },
  },
})
