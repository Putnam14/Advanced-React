import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'

const CURRENT_USER_QUERY = gql`
  query me {
    id
    email
    name
    permissions
  }
`

// Allow children to use the CURRENT_USER_QUERY
const User = props => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {payload => props.children(payload)}
  </Query>
)

export default User
export { CURRENT_USER_QUERY }
