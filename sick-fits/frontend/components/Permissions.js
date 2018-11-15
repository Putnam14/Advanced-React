import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import PropTypes from 'prop-types'
import Error from './ErrorMessage'
import Table from './styles/Table'
import SickButton from './styles/SickButton'

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
]

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`

const Permissions = () => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>
      return (
        <>
          <Error error={error} />
          <>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map(perm => (
                    <th key={perm}>{perm}</th>
                  ))}
                  <th>👇</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => (
                  <UserPermissions key={user.id} user={user} />
                ))}
              </tbody>
            </Table>
          </>
        </>
      )
    }}
  </Query>
)

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired,
  }

  state = {
    // This is fine since we're seeding the initial state.
    // Usually you should not set state with props, in case things change upstream.
    permissions: this.props.user.permissions,
  }

  handlePermissionChange = event => {
    const checkbox = event.target
    // Take a copy of state
    const { permissions } = this.state
    let updatedPermissions = [...permissions]
    // Add if the event was checking, remove if unchecking
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value)
    } else {
      updatedPermissions = updatedPermissions.filter(
        curr => curr !== checkbox.value
      )
    }
    // Update state
    this.setState({ permissions: updatedPermissions })
  }

  render() {
    const { user } = this.props
    const { permissions } = this.state
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{ permissions, userId: user.id }}
      >
        {(updatePermissions, { loading, error }) => (
          <>
            {error && (
              <tr>
                <td colSpan="8">
                  <Error error={error} />
                </td>
              </tr>
            )}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map(perm => (
                <td key={perm}>
                  <label htmlFor={`${user.id}-permission-${perm}-`}>
                    <input
                      type="checkbox"
                      id={`${user.id}-permission-${perm}-`}
                      checked={permissions.includes(perm)}
                      value={perm}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  // Disable so people don't click too fast
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat
                  {loading ? 'ing' : 'e'}
                </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    )
  }
}

export default Permissions
