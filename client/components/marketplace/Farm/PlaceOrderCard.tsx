import React, { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import { fetchToken } from '../token'
import { getMyCart, getMyConsumerProfile } from '../API'
import LocationCard from '../location/LocationCard'
import router from 'next/router';
import DonationCard from '../donation/DonationCard'


function PlaceOrderCard(props: any) {
  const routerData = router.query
  const [cartItems, setCartItems] = useState([])
  const [subTotal, setSubTotal] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [location, setLocation] = useState({
    lat: 0,
    lng: 0
  })
  const [walletAddress, setWalletAddress] = useState("")
  const [donation, setDonation] = useState(false)

  const handleOrder = async () => {
    try {
      setDonation(true)
      props.setShowDonation(true)
    } catch (error) {
      console.log(error)
    }
  }


  const fetch = async () => {
    try {
      const Token = fetchToken()
      const response = await getMyCart(Token)
      const data = response.data.data.data[0]
      setSubTotal(data.subTotal)
      setTotalItems(data.items.length)
      
      setCartItems(data.items)
      // console.log("data: ", data)

      const res = await getMyConsumerProfile(Token)
      const data2 = res.data.data.data[0]
      setLocation({
        lat: data2.location.coordinates[1],
        lng: data2.location.coordinates[0]
      })
      // console.log("props: ", props)
      // console.log("routerData: ", routerData)
      if(routerData.stock) {
        if(props.standard && !props.express) {
          console.log("deliveryCharge stock standard: ", data.items[0].stockProduct.businessProfile.shippingCostStandard)
          setDeliveryCharge(data.items[0].stockProduct.businessProfile.shippingCostStandard)
        } else if(!props.standard && props.express) {
          console.log("deliveryCharge stock express: ", data.items[0].stockProduct.businessProfile.shippingCostExpress)
          setDeliveryCharge(data.items[0].stockProduct.businessProfile.shippingCostExpress)
        }
        // setDeliveryCharge()
      }else if(routerData.ondemand) {
        console.log("deliveryCharge ondemand: ", data.items[0].ondemandProduct.businessProfile.shippingOndemandCost)
        setDeliveryCharge(data.items[0].ondemandProduct.businessProfile.shippingOndemandCost)
      }

      const addr1 = props.walletAddress.slice(0, 14)
      const addr2 = props.walletAddress.slice(27, 42)
      let addr = addr1 + "  ...  " + addr2
      addr = addr.replace(/(.{4})(?!$)/g, "$1 ")

      setWalletAddress(addr)

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const styles = {
    card: `w-full flex flex-col justify-center items-center`,
    headerTxt: `text-2sm font-bold`,
    container: `w-11/12 border-1 rounded-2xl border-light-gray flex flex-col justify-start items-center`,
    container1: `w-11/12 border-1 rounded-2xl border-light-gray flex flex-col justify-start items-center mt-5 h-36 mb-5`,
    container2: `w-11/12 border-1 rounded-2xl border-light-gray flex flex-col justify-center items-center mb-10`,
    smallTxt: `text-2sm font-semibold`,
    smallTxt1: `text-2sm font-semibold ml-3`,
    bigBtn: `w-11/12 rounded-3xl bg-green mb-5 text-2sm font-semibold h-8`,
  }

  return (
    <Box className={styles.card}>
      {
        donation ?
        <Box className={styles.card}>
          <DonationCard 
            setDonation={setDonation}
            setShowDonation={props.setShowDonation}
          /> 
        </Box> :
        <Box className={styles.card}>

          <Box className="w-full flex justify-center items-center mb-3">
            <span className={styles.headerTxt}>Review</span>
          </Box>
    
          <Box className={styles.container}>
            <Box className="w-10/12 mt-2">
              <span className='text-2sm font-bold'>{totalItems} Products</span>
            </Box>
    
            <Box className="w-10/12 h-10 flex flex-col justify-center items-center mt-3">
            {
              cartItems.map((item: any) => {
                return (
                  <Box key={item._id} className='w-full flex justify-between items-center'>
                    <Box className="">
                      <span className={styles.smallTxt}>{item?.orderQuantity} {item?.orderUnit}</span>
                      <span className={styles.smallTxt1}>{item?.ondemandProduct?.name || item?.stockProduct?.name}</span>
                    </Box>
                    <span className={styles.smallTxt}>$ {Number(item?.orderTotal).toFixed(3)}</span>
                  </Box>
                )
                })
              }
            </Box>
    
            <Box className="w-11/12 border-1 mt-5 mb-5 border-light-gray"></Box>
    
            <Box className="w-10/12 flex justify-between items-center">
              <span className={styles.smallTxt}>Subtotal</span>
              <span className={styles.smallTxt}>$ {Number(subTotal).toFixed(3)}</span>
            </Box>
    
            <Box className="w-10/12 flex justify-between items-center">
              <span className={styles.smallTxt}>Shipping</span>
              <span className={styles.smallTxt}>$ {deliveryCharge}</span>
            </Box>
    
            <Box className="w-11/12 border-1 mt-5 mb-5 border-light-gray"></Box>
    
            <Box className="w-10/12 flex justify-between items-center mb-5">
              <span className={styles.smallTxt}>Total</span>
              <span className='text-2sm font-bold'>$ {Number(Number(subTotal) + deliveryCharge).toFixed(3)}</span>
            </Box>
    
          </Box>
    
          <Box className={styles.container1}>
            <LocationCard 
              lat={location.lat}
              lng={location.lng}
            />
          </Box>
    
          <Box className={styles.container2}>
            <Box className="w-10/12 flex justify-start items-center mb-5 mt-3">
              <span className="text-2sm font-bold">Payment</span>
            </Box>
            <Box className="w-10/12 flex flex-col justify-center items-start mb-5">
              <span className="text-2sm font-semibold">Ankush Banik</span>
              <span className="text-2sm font-semibold">
                {walletAddress}
              </span>
            </Box>
          </Box>
    
          <button className={styles.bigBtn} onClick={handleOrder}>Place order now</button>
        </Box>
      }
    </Box>
  )
}

export default PlaceOrderCard