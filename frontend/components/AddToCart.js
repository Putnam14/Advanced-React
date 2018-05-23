import { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import PropTypes from 'prop-types';
import {
  ADD_TO_CART_MUTATION,
  CURRENT_USER_QUERY,
} from '../queries/queries.graphql';

class AddToCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  update = (cache, payload) => {
    const newCartItem = payload.data.addToCart;
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });

    const existingIndex = data.me.cart.findIndex(
      cartItem => cartItem.id === newCartItem.id,
    );
    if (existingIndex >= 0) {
      // already in cache, just replace it
      data.me.cart = [
        ...data.me.cart.slice(0, existingIndex),
        newCartItem,
        ...data.me.cart.slice(existingIndex + 1),
      ];
    } else {
      data.me.cart = [...data.me.cart, newCartItem];
    }
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  };

  render() {
    const { id } = this.props;
    return (
      <Query query={CURRENT_USER_QUERY}>
        {() => (
          <Mutation
            mutation={ADD_TO_CART_MUTATION}
            variables={{ id }}
            update={this.update}
          >
            {(addToCart, { loading }) => (
              <button disabled={loading} onClick={addToCart}>
                🛒 Add{loading && 'ing'} To Cart
              </button>
            )}
          </Mutation>
        )}
      </Query>
    );
  }
}

export default AddToCart;
