import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Item from './Item'
import Pagination from './Pagination'
import { perPage } from '../config'

const Center = styled.div`
  text-align: center;
`

const ItemsList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 60px;
    max-width: {props => props.theme.maxWidth};
    margin: 0 auto;
`

// Apollo recommends queries in the same file
const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(skip: $skip, first: $first, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`

class Items extends Component {
  render() {
    const { page } = this.props
    return (
      <Center>
        <div>
          <Pagination page={page} />
          <Query
            query={ALL_ITEMS_QUERY}
            fetchPolicy="cache-and-network"
            variables={{
              skip: page * perPage - perPage,
            }}
          >
            {({ data, error, loading }) => {
              if (loading) return <p>Loading...</p>
              if (error) return <p>Error: {error.message}</p>
              return (
                <ItemsList>
                  {data.items.map(item => (
                    <Item item={item} key={item.id} />
                  ))}
                </ItemsList>
              )
            }}
          </Query>
          <Pagination page={page} />
        </div>
      </Center>
    )
  }
}

export default Items
export { ALL_ITEMS_QUERY }
