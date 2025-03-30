import React from 'react'
import RentalCards from '../components/rentalCards'
import ManagementBar from '../components/managementBar'

const Management = () => {
  return (
    <>
      <div className="w-full h-screen bg-ellWhite flex items-center flex-col overflow-x-scroll">
        <ManagementBar/>
        <div className="h-[300vh]">
          <RentalCards/>
          <RentalCards/>
          <RentalCards/>
        </div>
      </div>
    </>
  )
}

export default Management
