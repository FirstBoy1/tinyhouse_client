import { Button, Card, DatePicker, Divider, Typography } from 'antd'
import moment, { Moment } from 'moment'
import { formatListingPrice, displayErrorMessage } from '../../../../lib/utils'

const { Paragraph, Title } = Typography

interface Props {
  price: number
  checkInDate: Moment | null
  checkOutDate: Moment | null
  setCheckInDate: (checkInDate: Moment | null) => void
  setCheckOutDate: (checkOutDate: Moment | null) => void
}

export const ListingCreateBooking = ({
  price,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
}: Props) => {
  const disabledDate = (currentDate?: Moment): boolean => {
    if (currentDate) {
      return currentDate.isBefore(moment().endOf('day'))
    } else {
      return false
    }
  }

  const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
    if (checkInDate && selectedCheckOutDate) {
      if (moment(selectedCheckOutDate).isBefore(checkInDate, 'days')) {
        return displayErrorMessage(
          "You can't book date of check out to be prior to check in!"
        )
      }
    }
    setCheckOutDate(selectedCheckOutDate)
  }

  const checkOutInputDisables = !checkInDate
  const buttonDisables = !checkInDate && !checkOutDate

  return (
    <div className="listing-booking">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatListingPrice(price)}
              <span>/day</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              value={checkInDate}
              format="YYYY/MM/DD"
              showToday={false}
              disabledDate={disabledDate}
              onChange={setCheckInDate}
              onOpenChange={() => setCheckOutDate(null)}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              value={checkOutDate}
              disabledDate={disabledDate}
              disabled={checkOutInputDisables}
              showToday={false}
              format="YYYY/MM/DD"
              onChange={(dateValue) => verifyAndSetCheckOutDate(dateValue)}
            />
          </div>
        </div>
        <Divider />
        <Button
          size="large"
          type="primary"
          disabled={buttonDisables}
          className="listing-booking__card-cta"
        >
          Request to book!
        </Button>
      </Card>
    </div>
  )
}
