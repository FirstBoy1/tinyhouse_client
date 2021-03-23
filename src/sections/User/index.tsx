import { useQuery } from '@apollo/react-hooks'
import { RouteComponentProps } from 'react-router'
import { Col, Layout, Row } from 'antd'
import { USER } from '../../lib/graphql/queries'
import {
  User as UserData,
  UserVariables,
} from '../../lib/graphql/queries/User/__generated__/User'
import { UserProfile } from './components'
import { Viewer } from '../../lib/types'
import { PageSkeleton } from '../../lib/components/PageSkeleton'
import { ErrorBanner } from '../../lib/components'

interface Props {
  viewer: Viewer
}

interface MatchParams {
  id: string
}

const { Content } = Layout

export const User = ({
  match,
  viewer,
}: Props & RouteComponentProps<MatchParams>) => {
  const { data, loading, error } = useQuery<UserData, UserVariables>(USER, {
    variables: {
      id: match.params.id,
    },
  })

  const user = data ? data.user : null
  const viewerIsUser = viewer.id === match.params.id
  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser} />
  ) : null

  if (loading) {
    return (
      <Content className="user">
        <PageSkeleton />
      </Content>
    )
  }

  if (error) {
    return (
      <Content className="user">
        <ErrorBanner description="This user may not exist or we've encounter some error. Please try again later!" />
        <PageSkeleton />
      </Content>
    )
  }

  return (
    <Content className="user">
      <Row gutter={12} justify="space-between">
        <Col xs={24}>{userProfileElement}</Col>
      </Row>
    </Content>
  )
}
