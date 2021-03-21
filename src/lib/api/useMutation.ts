import { useReducer } from 'react'
import { server } from './server'

interface State<TData> {
  data: TData | null
  loading: boolean
  error: boolean
}

type MutationTuple<TData, TVariables> = [
  (variables?: TVariables) => Promise<void>,
  State<TData>
]

type Action<TData> =
  | { type: 'FETCH' }
  | { type: 'FETCH_LOADING'; payload: TData }
  | { type: 'FETCH_ERROR' }

const reducer = <TData>() => (
  state: State<TData>,
  action: Action<TData>
): State<TData> => {
  switch (action.type) {
    case 'FETCH': {
      return { ...state, loading: true }
    }
    case 'FETCH_LOADING': {
      return { loading: false, data: action.payload, error: false }
    }
    case 'FETCH_ERROR': {
      return { loading: false, data: null, error: true }
    }
    default:
      throw new Error('Unknown action type in useMutation')
  }
}

export function useMutation<TData = any, TVariables = any>(
  query: string
): MutationTuple<TData, TVariables> {
  const fetchReducer = reducer<TData>()
  const [state, dispatch] = useReducer(fetchReducer, {
    loading: false,
    data: null,
    error: false,
  })

  const fetch = async (variables?: TVariables) => {
    try {
      dispatch({ type: 'FETCH' })
      const { data, errors } = await server.fetch<TData, TVariables>({
        query,
        variables,
      })
      if (errors && errors.length) {
        throw errors[0].message
      }
      dispatch({ type: 'FETCH_LOADING', payload: data })
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR' })
      throw console.error(err)
    }
  }

  return [fetch, state]
}
