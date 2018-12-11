import { shallow } from 'enzyme'
import toJSON from 'enzyme-to-json'
import ItemComponent from '../components/Item'

const fakeItem = {
  id: 'ABC123',
  title: 'A cool item',
  price: 5000,
  description: 'This item is really cool!',
  image: 'dog.jpeg',
  largeImage: 'largedog.jpeg',
}

describe('<Item />', () => {
  it('renders the component', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    expect(toJSON(wrapper)).toMatchSnapshot()
  })
  it('renders the image', () => {
    // Shallow render the Item component
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const Image = wrapper.find('img')
    expect(Image.props().src).toBe(fakeItem.image)
    expect(Image.props().alt).toBe(fakeItem.title)
  })

  it('renders the title and price tag', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const PriceTag = wrapper.find('PriceTag')
    expect(PriceTag.children().text()).toBe('$50')
    expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
  })

  it('renders out the buttons', () => {
    const wrapper = shallow(<ItemComponent item={fakeItem} />)
    const buttonList = wrapper.find('.buttonList')
    expect(buttonList.children()).toHaveLength(3)
    // Three ways to see if a tag exists:
    expect(buttonList.find('Link')).toHaveLength(1)
    expect(buttonList.find('Link').exists()).toBe(true)
    expect(buttonList.find('Link')).toBeTruthy()

    expect(buttonList.find('AddToCart').exists()).toBe(true)
    expect(buttonList.find('DeleteItem').exists()).toBe(true)
  })
})
