import { useMutation, useQuery } from '../../lib/api'
import {
  DeleteListingData,
  DeleteListingVariables,
  ListingsData,
} from './types'

interface Props {
  title: string
}

const LISTINGS = `
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

const DELETE_LISTING = `
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
    await deleteListing({ id })
    refetch()
  }

  const listings = data ? data.listings : null

  const listingsList = listings ? (
    <ul>
      {listings.map((listing) => (
        <li key={listing.id}>
          {listing.title}
          <button onClick={() => handleDeleteListing(listing.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  ) : null

  if (error) {
    return <h2>Something went wrong, Please try again later...</h2>
  }

  if (loading) {
    return <h2>Loading...</h2>
  }

  const deleteListingLoadingMessage = deleteListingLoading ? (
    <h4>Deletion in progress...</h4>
  ) : null
  const deleteListingErrorMessage = deleteListingError ? (
    <h4>Something went wrong while deletion, Try again later.</h4>
  ) : null

  return (
    <div>
      <h2>{title}</h2>
      {listingsList}
      {deleteListingLoadingMessage}
      {deleteListingErrorMessage}
    </div>
  )
}
