import { useEffect, useRef } from 'react'
import { Layout, Typography, Card, Spin } from 'antd'
import { useApolloClient, useMutation } from '@apollo/react-hooks'

import { Viewer } from '../../lib/types'
import googleLogo from './assets/google_logo.jpg'
import { AUTH_URL } from '../../lib/graphql/queries/AuthUrl'
import { LOGIN } from '../../lib/graphql/mutations'
import { AuthUrl as AuthUrlData } from '../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl'
import {
  Login as LoginData,
  LoginVariables as LoginVariablesData,
} from '../../lib/graphql/mutations/Login/__generated__/Login'
import {
  displayErrorMessage,
  displaySuccessNotification,
} from '../../lib/utils'
import { ErrorBanner } from '../../lib/components'
import { Redirect } from 'react-router'

const { Title, Text } = Typography
const { Content } = Layout

interface Props {
  setViewer: (viewer: Viewer) => void
}

export const Login = ({ setViewer }: Props) => {
  const client = useApolloClient()
  const [
    login,
    { data: loginData, loading: logInLoading, error: loginError },
  ] = useMutation<LoginData, LoginVariablesData>(LOGIN, {
    onCompleted(data) {
      if (data && data.login && data.login.token) {
        setViewer(data.login)
        displaySuccessNotification("You' successfully logged in!")
        sessionStorage.setItem('token', data.login.token)
      }
    },
  })

  const loginRef = useRef(login)

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code')
    if (code) {
      loginRef.current({ variables: { input: { code } } })
    }
  }, [])

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({ query: AUTH_URL })
      window.location.href = data.authUrl
    } catch (error) {
      displayErrorMessage(
        "Sorry we wern't able to log you in. Please try again later!"
      )
    }
  }

  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    )
  }

  if (loginData && loginData.login) {
    const { id: viewerId } = loginData.login
    return <Redirect to={`/user/${viewerId}`} />
  }

  const loginErrorBannerElement = loginError ? (
    <ErrorBanner description="Sorry we wern't able to log you in. Please try again later!" />
  ) : null

  return (
    <Content className="log-in">
      {loginErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Login to TinyHouse!
          </Title>
          <Text>Signin with Google to start booking available rentals!</Text>
        </div>
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Signin with Google
          </span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the Google consent form
          to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  )
}
