import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import ApolloClient from 'apollo-boost'
import { ApolloProvider, useMutation } from 'react-apollo'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Layout, Affix, Spin } from 'antd'
import reportWebVitals from './reportWebVitals'
import { Viewer } from './lib/types'
import {
  Home,
  Host,
  Listing,
  Listings,
  User,
  NotFound,
  Login,
  AppHeader,
} from './sections'
import './styles/index.css'
import {
  Login as LoginData,
  LoginVariables,
} from './lib/graphql/mutations/Login/__generated__/Login'
import { LOGIN } from './lib/graphql/mutations'
import { AppHeaderSkeleton, ErrorBanner } from './lib/components'

const apolloClient = new ApolloClient({
  uri: '/api',
  request: async (operration) => {
    const token = sessionStorage.getItem('token')
    operration.setContext({
      headers: {
        'X-CSRF-TOKEN': token || '',
      },
    })
  },
})

const initialViewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
}

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer)
  const [login, { error }] = useMutation<LoginData, LoginVariables>(LOGIN, {
    onCompleted(data) {
      if (data && data.login) {
        setViewer(data.login)
      }

      if (data.login.token) {
        sessionStorage.setItem('token', data.login.token)
      } else {
        sessionStorage.removeItem('token')
      }
    },
  })

  useEffect(() => {
    login()
  }, [login])

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    )
  }

  const loginErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to login if you were logged in. Please try again later!" />
  ) : null

  return (
    <Router>
      <Layout id="app">
        {loginErrorBannerElement}
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/host" component={Host} />
          <Route exact path="/listing/:id" component={Listing} />
          <Route exact path="/listings/:location?" component={Listings} />
          <Route
            exact
            path="/user/:id"
            render={(props) => <User {...props} viewer={viewer} />}
          />
          <Route
            exact
            path="/login"
            render={(props) => <Login {...props} setViewer={setViewer} />}
          />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  )
}

ReactDOM.render(
  // <React.StrictMode>
  <ApolloProvider client={apolloClient}>
    <App />
  </ApolloProvider>,
  // </React.StrictMode>
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
