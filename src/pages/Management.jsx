import React from 'react'
import RentalCards from '../components/rentalCards'
import ManagementBar from '../components/managementBar'

const Management = () => {
  return (
    <>
      <div className="w-full h-fit bg-ellWhite flex items-center flex-col">
        <ManagementBar/>
          <RentalCards/>
          <RentalCards/>
          <RentalCards/>
      </div>
    </>
  )
}

export default Management
