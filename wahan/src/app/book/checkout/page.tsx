import Checkout from '@/components/Checkout'
import React, { Suspense } from 'react'

const page = () => {
  return (
   <Suspense fallback={<div>Loading...</div>}>
    <Checkout/>
   </Suspense>
  )
}

export default page