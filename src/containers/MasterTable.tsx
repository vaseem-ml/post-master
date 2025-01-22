import React, { useState, useEffect } from 'react';

import { Pagination, message, Button, Spin, Table } from 'antd';

const TAG = "MasterTable: ";
const MasterTable = () => {

  const [rowData, setRowData] = useState<any>([]);
  const [rowMeta, setRowMeta] = useState<any>(null);
  const [loader, setLoader] = useState<boolean>(true);
  const [payload, setPayload] = useState({ page: 1, page_size: 10 });


  useEffect(() => {
    callDataSeeker();
  }, [payload]);

  async function callDataSeeker() {
    console.log("callDataSeeker got called");
    const queryTable = {
      page: payload?.page,
      limit: payload?.page_size,
      search: null,
      sort: { createdAt: -1 }
    }

    await window.getMasterData.getData(queryTable, "dummyurl");

    window.getMasterData.receiveMessage((response: any) => {
      const { status, data } = JSON.parse(response);
      console.log("status", status);
      console.log("data", data);
      if (status == true) {
        // message.success("Master data fetched.");
        setRowData(data?.data);
        setRowMeta(data?.meta);
      } else {
        message.error("Something went wrong while fetching master data.");
        message.error(JSON.stringify(data));
      }
    });

    setLoader(false);

  }

  const columns = [
    {
      title: "Pincode No",
      dataIndex: "pincode",
      ellipsis: false,
      render: (pincode: string) => {
        return (
          <span>{pincode || "-"}</span>
        );
      },
    },
    {
      title: "Facility ID",
      dataIndex: "facility_id",
      ellipsis: true,
      render: (facility_id: string) => {
        return (
          <span>{facility_id || "-"}</span>
        );
      },
    },
    {
      title: "Booking office",
      dataIndex: "booking_office",
      ellipsis: false,
      render: (booking_office: string) => {
        return (
          <span>{booking_office || "-"}</span>
        );
      },
    },
    {
      title: "Name of Office",
      dataIndex: "office_name",
      ellipsis: false,
      render: (office_name: string) => {
        return (
          <span>{office_name || "-"}</span>
        );
      },
    },
    {
      title: "Division",
      dataIndex: "division",
      ellipsis: false,
      render: (division: string) => {
        return (
          <span>{division || "-"}</span>
        );
      },
    },
    {
      title: "Region",
      dataIndex: "region",
      ellipsis: false,
      render: (region: string) => {
        return (
          <span>{region || "-"}</span>
        );
      },
    },
    {
      title: "D1",
      dataIndex: "d1",
      ellipsis: false,
      render: (d1: string) => {
        return (
          <span>{d1 || "-"}</span>
        );
      },
    },
    {
      title: "D2",
      dataIndex: "d2",
      ellipsis: false,
      render: (d2: string) => {
        return (
          <span>{d2 || "-"}</span>
        );
      },
    },
  ];


  // console.log(TAG + " rowMeta ", rowMeta);
  // console.log(TAG + " rowData ", rowData);

  return (
    <div className='mt-3'>
      <Spin spinning={loader}>

        <Table
          rowKey={"_id"}
          pagination={false}
          dataSource={rowData || []}
          columns={columns}
        />

        <div className='mt-5 flex justify-center'>
          <Pagination
            current={rowMeta?.page || 0}
            pageSize={rowMeta?.limit || 10}
            total={rowMeta?.total}
            pageSizeOptions={[10, 20, 30, 40]}
            showSizeChanger
            onChange={(page, page_size) => {
              setPayload({ ...payload, page, page_size });
            }}
            onShowSizeChange={(page: number, page_size: number) => {
              setPayload({ ...payload, page, page_size });
            }}
          />
        </div>

      </Spin>
    </div>
  )
}

export default MasterTable;