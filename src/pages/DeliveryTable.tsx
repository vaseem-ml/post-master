import React from 'react';

import Delivery from "../containers/DeliveryTable";

const TAG = "DeliveryTable: ";
function DeliveryTablePage() {
  return (
    <div className='w- p-3'>
      <div className="text-[#000000] text-[18px]">Delivery Data</div>
      <Delivery />
    </div>
  )
}

export default DeliveryTablePage;