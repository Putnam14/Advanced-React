import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloConsumer } from 'react-apollo'
import NProgress from 'nprogress'
import Router from 'next/router'
import { fakeUser, fakeCartItem } from '../lib/testUtils'
import Cart, { LOCAL_STATE_QUERY } from '../components/Cart'
import { CURRENT_USER_QUERY } from '../components/User'
import TakeMyMoney, { CREATE_ORDER_MUTATION } from '../components/TakeMyMoney'

Router.router = { push() {} }

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        me: {
          ...fakeUser(),
          cart: [fakeCartItem()],
        },
      },
    },
  },
]

describe('<TakeMyMoney/>', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const checkoutButton = wrapper.find('ReactStripeCheckout')
    expect(toJSON(checkoutButton)).toMatchSnapshot()
  })
  it('creates an order ontoken', async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    })
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    )
    const component = wrapper.find('TakeMyMoney').instance()
    // Manually call onToken method
    component.onToken({ id: 'abc123' }, createOrderMock)
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: 'abc123' },
    })
  })
  it('turns the progress bar on', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    NProgress.start = jest.fn()
    const component = wrapper.find('TakeMyMoney').instance()
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    })
    component.onToken({ id: 'abc123' }, createOrderMock)
    expect(NProgress.start).toHaveBeenCalled()
  })
  it('routes to the order page when completed', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMyMoney />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    const component = wrapper.find('TakeMyMoney').instance()
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: 'xyz789',
        },
      },
    })
    Router.router.push = jest.fn()
    component.onToken({ id: 'abc123' }, createOrderMock)
    await wait()
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: '/order',
      query: { id: 'xyz789' },
    })
  })
})
