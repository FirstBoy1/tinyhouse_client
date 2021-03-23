import { Link } from 'react-router-dom'
import { Button, Menu, Avatar } from 'antd'
import {
  HomeOutlined,
  UserAddOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Viewer } from '../../../../lib/types'
import { useMutation } from '@apollo/react-hooks'
import { Logout } from '../../../../lib/graphql/mutations/Logout/__generated__/Logout'
import { LOGOUT } from '../../../../lib/graphql/mutations'
import {
  displayErrorMessage,
  displaySuccessNotification,
} from '../../../../lib/utils'

const { Item, SubMenu } = Menu

interface Props {
  viewer: Viewer
  setViewer: (viewer: Viewer) => void
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logout] = useMutation<Logout>(LOGOUT, {
    onCompleted(data) {
      if (data && data.logout) {
        setViewer(data.logout)
        displaySuccessNotification("You've succesfully log out!")
        sessionStorage.removeItem('token')
      }
    },
    onError() {
      displayErrorMessage(
        "Sorry we weren't able to log you out. Please try again later!"
      )
    },
  })

  const handleLogout = () => {
    logout()
  }

  const subMenuLogin = viewer.id ? (
    <SubMenu title={<Avatar src={viewer.avatar} />}>
      <Item key="/user">
        <Link to={`/user/${viewer.id}`}>
          <UserAddOutlined />
          Profile
        </Link>
      </Item>
      <Item key="/logout">
        <div onClick={handleLogout}>
          <LogoutOutlined />
          Logout
        </div>
      </Item>
    </SubMenu>
  ) : (
    <Item>
      <Link to="/login">
        <Button type="primary">Sign In</Button>
      </Link>
    </Item>
  )

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined />
        </Link>
        Home
      </Item>
      {subMenuLogin}
    </Menu>
  )
}
