import PleaseSignIn from '../components/PleaseSignIn'
import Order from '../components/Order'

const OrderPage = props => (
  <PleaseSignIn>
    <Order id={props.query.id} />
  </PleaseSignIn>
)

export default OrderPage
