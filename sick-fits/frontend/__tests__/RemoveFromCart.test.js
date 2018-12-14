import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import { ApolloConsumer } from 'react-apollo'
import { MockedProvider } from 'react-apollo/test-utils'
import { fakeUser, fakeCartItem } from '../lib/testUtils'
import { CURRENT_USER_QUERY } from '../components/User'
import RemoveFromCart, {
  REMOVE_FROM_CART_MUTATION,
} from '../components/RemoveFromCart'

global.alert = console.log

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: { me: { ...fakeUser(), cart: [fakeCartItem({ id: 'abc123' })] } },
    },
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'abc123' } },
    result: {
      data: {
        removeFromCart: {
          __typename: 'CartItem',
          id: 'abc123',
        },
      },
    },
  },
]

describe('<RemoveFromCart/>', () => {
  it('Renders and matches snsapshot', () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="abc123" />
      </MockedProvider>
    )
    expect(toJSON(wrapper.find('button'))).toMatchSnapshot()
  })
  it('removes the item from cart', async () => {
    let apolloClient
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client
            return <RemoveFromCart id="abc123" />
          }}
        </ApolloConsumer>
      </MockedProvider>
    )
    const {
      data: { me },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY })
    expect(me.cart).toHaveLength(1)
    expect(me.cart[0].item.price).toBe(5000)
    wrapper.find('button').simulate('click')
    await wait(50)
    wrapper.update()
    const {
      data: { me: me2 },
    } = await apolloClient.query({ query: CURRENT_USER_QUERY })
    expect(me2.cart).toHaveLength(0)
  })
})
