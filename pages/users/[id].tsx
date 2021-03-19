import { User } from '../../interfaces'
import Layout from '../../components/Layout'
import ListDetail from '../../components/ListDetail'
import useSWR from 'swr'
import { fetcher } from '../../utils/fetcher'
import { useRouter } from 'next/router'

const Detail = () => {
  const router = useRouter()
  const { data, error } = useSWR<User>(
    router.query.id ? ['/api/users', Number(router.query.id)] : null,
    fetcher
  )
  if (!router.query.id) {
    return <Layout title={`loading id`}>Loading id</Layout>
  }
  if (error) {
    return (
      <Layout title='Error'>
        <p>
          <span style={{ color: 'red' }}>Error:</span> {error.message}
        </p>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout title={`loading user ${router.query.id}`}>
        <p>{`loading user ${router.query.id}`}</p>
      </Layout>
    )
  }

  return (
    <Layout title={data.name}>
      <ListDetail item={data} />
    </Layout>
  )
}

export default Detail
