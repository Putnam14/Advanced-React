function Person(name, foods) {
  this.name = name
  this.foods = foods
}

Person.prototype.fetchFavFoods = function() {
  return new Promise((resolve, reject) => {
    // Simulate an API
    setTimeout(() => resolve(this.foods), 2000)
  })
}

describe('mocking learning', () => {
  it('mocks a reg function', () => {
    const fetchDogs = jest.fn()
    fetchDogs('snickers')
    expect(fetchDogs).toHaveBeenCalled()
    expect(fetchDogs).toHaveBeenCalledWith('snickers')
    fetchDogs('hugo')
    expect(fetchDogs).toHaveBeenCalledTimes(2)
  })
  it('can create a person', () => {
    const me = new Person('Bridger', [
      'baklava',
      'passionfruit',
      'chocolate',
      'cobbler',
    ])
    expect(me.name).toBe('Bridger')
  })
  it('can fetch foods', async () => {
    const me = new Person('Bridger', [
      'baklava',
      'passionfruit',
      'chocolate',
      'cobbler',
    ])
    /* const favFoods = await me.fetchFavFoods()
    expect(favFoods).toContain('chocolate') */
    // Mock the fetchFavFoods function
    me.fetchFavFoods = jest.fn().mockResolvedValue(['sushi', 'ramen'])
    const favFoods2 = await me.fetchFavFoods()
    expect(favFoods2).toContain('sushi')
  })
})
