import React from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import User from './User'
import CartItem from './CartItem'

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`

const Cart = () => (
  <User>
    {({ data: { me } }) => {
      console.log(me)
      if (!me) return null
      return (
        <Mutation mutation={TOGGLE_CART_MUTATION}>
          {toggleCart => (
            <Query query={LOCAL_STATE_QUERY}>
              {({ data }) => (
                <CartStyles onClick={toggleCart} open={data.cartOpen}>
                  <header>
                    <CloseButton title="close">&times;</CloseButton>
                    <Supreme>
                      {me.name}
                      's Cart
                    </Supreme>
                    <p>
                      You have {me.cart.length} item
                      {me.cart.length >= 2 ? 's' : ''} in your cart
                    </p>
                  </header>
                  <ul>
                    {me.cart.map(cartItem => (
                      <CartItem key={cartItem.id} cartItem={cartItem} />
                    ))}
                  </ul>
                  <footer>
                    <p>$10.10</p>
                    <SickButton>Checkout</SickButton>
                  </footer>
                </CartStyles>
              )}
            </Query>
          )}
        </Mutation>
      )
    }}
  </User>
)

export default Cart
export { LOCAL_STATE_QUERY }
export { TOGGLE_CART_MUTATION }
