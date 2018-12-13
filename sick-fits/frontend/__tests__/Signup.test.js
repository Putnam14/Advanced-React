import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloConsumer } from 'react-apollo'
import Signup, { SIGNUP_MUTATION } from '../components/Signup'
import { CURRENT_USER_QUERY } from '../components/User'
import { fakeUser } from '../lib/testUtils'

const type = (wrapper, name, value) => {
  wrapper
    .find(`input[name="${name}"]`)
    .simulate('change', { target: { name, value } })
}
const me = fakeUser()
const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        email: me.email,
        name: me.name,
        password: 'hmm',
      },
    },
    result: {
      data: {
        signup: {
          id: 'abc123',
          email: me.email,
          name: me.email,
          __typename: 'User',
        },
      },
    },
  },
  {
    request: {
      query: CURRENT_USER_QUERY,
    },
    result: {
      data: { me },
    },
  },
]

describe('<Signup/>', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <Signup />
      </MockedProvider>
    )
    expect(toJSON(wrapper.find('form'))).toMatchSnapshot()
  })
  it('calls the mutation', async () => {
    // Expose the apollo client
    let apolloClient = ''
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client
            return <Signup />
          }}
        </ApolloConsumer>
      </MockedProvider>
    )
    await wait()
    wrapper.update()
    type(wrapper, 'name', me.name)
    type(wrapper, 'email', me.email)
    type(wrapper, 'password', 'hmm')
    wrapper.update()
    wrapper.find('form').simulate('submit')
    await wait(50)
    // Query the user out of the apollo client
    const user = await apolloClient.query({ query: CURRENT_USER_QUERY })
    expect(user.data.me).toMatchObject(me)
  })
})
