import { useEffect, useCallback, useReducer } from 'react'
import { server } from './server'

interface State<TData> {
  data: TData | null
  loading: boolean
  error: boolean
}

interface QueryResult<TData> extends State<TData> {
  refetch: () => Promise<void>
}

type Action<TData> =
  | { type: 'FETCH' }
  | { type: 'FETCH_SUCCESS'; payload: TData }
  | { type: 'FETCH_ERROR' }

const reducer = <TData>() => (
  state: State<TData>,
  action: Action<TData>
): State<TData> => {
  switch (action.type) {
    case 'FETCH': {
      return { ...state, loading: true }
    }
    case 'FETCH_SUCCESS': {
      return { loading: false, data: action.payload, error: false }
    }
    case 'FETCH_ERROR': {
      return { loading: false, data: null, error: true }
    }
    default:
      throw new Error(`Unknown action type in useQuery`)
  }
}

export function useQuery<TData = any>(query: string): QueryResult<TData> {
  const fetchReducer = reducer<TData>()
  const [state, dispatch] = useReducer(fetchReducer, {
    loading: false,
    data: null,
    error: false,
  })

  const fetchApi = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH' })
      const { data, errors } = await server.fetch<TData>({ query })
      if (errors && errors.length) {
        throw errors[0].message
      }
      dispatch({ type: 'FETCH_SUCCESS', payload: data })
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR' })
      throw console.error(err)
    }
  }, [query])

  useEffect(() => {
    fetchApi()
  }, [fetchApi])

  return { ...state, refetch: fetchApi }
}
