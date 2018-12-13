import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import { MockedProvider } from 'react-apollo/test-utils'
import Router from 'next/router'
import Pagination, { PAGINATION_QUERY } from '../components/Pagination'

Router.router = {
  push() {},
  prefetch() {},
}

const makeMocksFor = length => [
  {
    request: { query: PAGINATION_QUERY },
    result: {
      data: {
        itemsConnection: {
          __typename: 'aggregate',
          aggregate: { __typename: 'count', count: length },
        },
      },
    },
  },
]

describe('<Pagination/>', () => {
  it('displays a loading message', () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(1)}>
        <Pagination page={1} />
      </MockedProvider>
    )
    expect(wrapper.text()).toContain('Loading...')
  })
  it('renders pagination for 18 items', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.find('.totalPages').text()).toEqual('5')
    const pagination = wrapper.find('div[data-test="pagination"]')
    expect(toJSON(pagination)).toMatchSnapshot()
  })
  it('disables prev button on first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={1} />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(true)
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false)
  })
  it('disables next button on last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={5} />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false)
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(true)
  })
  it('enables both buttons on middle pages', async () => {
    const wrapper = mount(
      <MockedProvider mocks={makeMocksFor(18)}>
        <Pagination page={4} />
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    expect(wrapper.find('a.prev').prop('aria-disabled')).toEqual(false)
    expect(wrapper.find('a.next').prop('aria-disabled')).toEqual(false)
  })
})
