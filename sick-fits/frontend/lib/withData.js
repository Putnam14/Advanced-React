// Next-Apollo package to make sure server-side rendering works
import withApollo from 'next-with-apollo'
// You can import Apollo along with any 'link's you want, or do this
import ApolloClient from 'apollo-boost'
import { endpoint } from '../config'
import { LOCAL_STATE_QUERY } from '../components/Cart'

function createClient({ headers }) {
  return new ApolloClient({
    // Can change this if you have different Yoga APIs for dev, prod
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          // Bring cookies along for the ride
          credentials: 'include',
        },
        headers,
      })
    },
    // Local state
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) {
            // Read the cartOpen value from cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            })
            // Write the cart state to the opposite
            const data = {
              data: {
                cartOpen: !cartOpen,
              },
            }
            cache.writeData(data)
            return data
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  })
}

// Use to create client in _app.js
export default withApollo(createClient)
