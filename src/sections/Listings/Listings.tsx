import { useMutation, useQuery } from 'react-apollo'
import { gql } from 'apollo-boost'
import { List, Avatar, Button, Spin, Alert } from 'antd'
import { Listings as ListingsData } from './__generated__/Listings'
import {
  DeleteListing as DeleteListingData,
  DeleteListingVariables,
} from './__generated__/DeleteListing'
import { ListingsSkeleton } from './components'

import './styles/Listings.css'

interface Props {
  title: string
}

const LISTINGS = gql`
  query Listings {
    listings {
      id
      title
      image
      address
      price
      numOfGuests
      numOfBeds
      numOfBaths
      rating
    }
  }
`

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id) {
      id
    }
  }
`

export const Listings = ({ title }: Props) => {
  const { data, loading, error, refetch } = useQuery<ListingsData>(LISTINGS)
  const [
    deleteListing,
    { error: deleteListingError, loading: deleteListingLoading },
  ] = useMutation<DeleteListingData, DeleteListingVariables>(DELETE_LISTING)

  async function handleDeleteListing(id: string) {
    await deleteListing({ variables: { id } })
    refetch()
  }

  const listings = data ? data.listings : null

  const listingsList = listings ? (
    <List
      itemLayout="horizontal"
      dataSource={listings}
      renderItem={(listing) => (
        <List.Item
          actions={[
            <Button
              type="primary"
              onClick={() => handleDeleteListing(listing.id)}
            >
              Delete
            </Button>,
          ]}
        >
          <List.Item.Meta
            title={listing.title}
            description={listing.address}
            avatar={<Avatar src={listing.image} shape="square" size={48} />}
          />
        </List.Item>
      )}
    />
  ) : null

  if (error) {
    return (
      <div className="listings">
        <ListingsSkeleton title={title} error />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="listings">
        <ListingsSkeleton title={title} error={error} />
      </div>
    )
  }

  const deleteListingErrorAlert = deleteListingError ? (
    <Alert
      type="error"
      message="Something went wrong while deletion, Try again later."
      className="listing__alert"
    />
  ) : null

  return (
    <div className="listings">
      <Spin spinning={deleteListingLoading} />
      {deleteListingErrorAlert}
      <h2>{title}</h2>
      {listingsList}
    </div>
  )
}
