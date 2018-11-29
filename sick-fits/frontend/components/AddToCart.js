import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import { CURRENT_USER_QUERY } from './User'

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`

class AddToCart extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  }

  render() {
    const { id } = this.props
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(addToCart, { loading }) => (
          <button type="button" disabled={loading} onClick={addToCart}>
            Add
            {loading && 'ing'} To Cart 🛒
          </button>
        )}
      </Mutation>
    )
  }
}

export default AddToCart
