import useSWR, { cache } from 'swr'
import Layout from '../components/Layout'
import { User } from '../interfaces'
import React from 'react'
import List from '../components/List'

const fetcher = (url: string, id: number) =>
  fetch(`${url}/${id}`).then((v) => v.json())

const queryList: QueryList = [
  {
    queryKey: ['/api/users', 101],
    queryFn: fetcher,
  },
  {
    queryKey: ['/api/users', 102],
    queryFn: fetcher,
  },
  {
    queryKey: ['/api/users', 103],
    queryFn: fetcher,
  },
]

type QueryList = Array<{
  queryKey: [string, number]
  queryFn: typeof fetcher
}>

type QueryResultItem =
  | {
      data: User
      error: null
    }
  | {
      data: null
      error: unknown
    }

function useSWRList(
  queryList: QueryList,
  config?: {
    onSettle?: (result: QueryResultItem[]) => void
    onDataUpdate?: (index: number, data: User) => void
    onErrorUpdate?: (index: number, error: unknown) => void
  }
) {
  const mounted = React.useRef(false)
  const configRef = React.useRef(config)
  const mutations = queryList.map(({ queryKey, queryFn }, i) => {
    const { mutate } = useSWR(queryKey, queryFn, {
      // onDataUpdate
      onSuccess: (data: User, key, config) => {
        if (config.compare(cache.get(key), data)) return
        configRef.current?.onDataUpdate?.(i, data)
      },
      // onErrorUpdate
      onError: (error) => {
        configRef.current?.onErrorUpdate?.(i, error)
      },
    })
    return () =>
      mutate()
        .then((v) => ({ data: v, error: null }))
        .catch((e) => ({ error: e, data: null }))
  })

  const loadAll = React.useCallback(() => {
    Promise.all(mutations.map((v) => v())).then((v) => {
      if (mounted.current) {
        configRef.current?.onSettle?.(v)
      }
    })
  }, [queryList])

  React.useEffect(() => {
    loadAll()
  }, [loadAll])

  React.useEffect(() => {
    configRef.current = config
  })
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  return loadAll
}

function SWRList() {
  const [list, updateList] = React.useState<QueryResultItem[]>([])
  const reload = useSWRList(queryList, {
    onSettle: updateList,
    onDataUpdate: (index, data) => {
      updateList((v) =>
        v.map((item, i) => (i === index ? { data, error: null } : item))
      )
    },
    onErrorUpdate: (index, error) => {
      updateList((v) =>
        v.map((item, i) => (i === index ? { data: null, error } : item))
      )
    },
  })
  return (
    <>
      <List items={list.filter((v) => !v.error).map((v) => v.data) as User[]} />
      <button onClick={reload}>reload</button>
    </>
  )
}

const IndexPage = () => (
  <Layout title='SWR List'>
    <h1>Hello Next.js 👋</h1>
    <SWRList></SWRList>
  </Layout>
)

export default IndexPage
