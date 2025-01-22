import React from 'react';

import MasterTable from "../containers/MasterTable";

const TAG = "MasterTable: ";
function MasterTablePage() {
  return (
    <div className='w- p-3'>
      <div className="text-[#000000] text-[18px]">Master Data</div>
      <MasterTable />
    </div>
  )
}

export default MasterTablePage;