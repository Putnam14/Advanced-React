import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { LOCAL_STATE_QUERY } from '../queries/queries.graphql';
// can also be a function that accepts a `headers` object (SSR only) and returns a config

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? 'http://localhost:4444' : 'http://localhost:4444',
    ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
    request: async operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart(_, variables, { cache }) {
            const { cartOpen } = cache.read({ query: LOCAL_STATE_QUERY });
            const data = { data: { cartOpen: !cartOpen } };
            cache.writeData(data);
            return data;
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  });
}

export default withApollo({ client: createClient });
