import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Pagination, message, Button, Spin, Table, Select, DatePicker, Modal, Input } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';

import { deliveryStatusDropOpt } from '../utils/utils';
import { isEmpty } from 'lodash';

const TAG = "DeliveryTable: ";
const DeliveryTable = () => {

  const [loader, setLoader] = useState<boolean>(true);
  const [rowData, setRowData] = useState<any>([]);
  const [rowMeta, setRowMeta] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<any>();
  const [statusToUpdate, setStatusToUpdate] = useState<any>();
  const [dates, setDates] = useState<any>(['', '']);
  const [payload, setPayload] = useState({ page: 1, page_size: 10 });

  const [searchString, setSearchString] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);


  const { RangePicker } = DatePicker;
  const { confirm } = Modal;

  useEffect(() => {
    callDataSeeker();
  }, [payload, sortOrder, sortField]);

  const filterOp = () => {
    callDataSeeker();
  }

  async function callDataSeeker() {
    console.log("callDataSeeker got called");

    let startDate = null, endDate = null, status = null, filter = null, searchStr = null;
    if (isEmpty(dates) == false && dates?.length > 0 && dates?.[0] !== "" && dates?.[1] !== "") {
      startDate = dayjs(dates[0], "DD-MM-YYYY").format("YYYY-MM-DD");
      endDate = dayjs(dates[1], "DD-MM-YYYY").format("YYYY-MM-DD");
    }

    if (isEmpty(statusFilter) == false) {
      status = statusFilter;
    }

    // if (isEmpty(status) == false) {
    //   filter = [{ status: status }];
    // }

    if (searchString !== "") {
      searchStr = searchString;
    }

    let queryTable = {
      page: payload?.page,
      limit: payload?.page_size,
      startDate: startDate,
      endDate: endDate,
      status: status,
      search: searchStr,
    }

    if (sortField == "" || sortField == undefined) {
      status = sortField;
      Object.assign(queryTable, { sort: null })
    } else {
      Object.assign(queryTable, { sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } })
    }

    console.log(TAG + "queryTable", queryTable);

    await window.getDeliveryData.getData(queryTable, "dummyurl");

    window.getDeliveryData.receiveMessage((response: any) => {
      const { status, data } = JSON.parse(response);
      console.log("getDeliveryData status", status);
      console.log("getDeliveryData data", data);
      if (status == true) {
        // message.success("Delivery data fetched.");
        setRowData(data?.data);
        setRowMeta(data?.meta);
      } else {
        message.error("Something went wrong while fetching delivery data.");
        message.error(JSON.stringify(data));
      }
    });

    setLoader(false);

  }

  async function updateOp() {

    setLoader(true);
    // await window.getDeliveryData.getData(statusToUpdate, "dummyurl");

    // window.getDeliveryData.receiveMessage((response: any) => {
    //   const { status, data } = JSON.parse(response);
    //   console.log("getDeliveryData status", status);
    //   console.log("getDeliveryData data", data);
    //   if (status == true) {
    //     message.success("Updated.");
    //   } else {
    //     message.error("Something went wrong while fetching delivery data.");
    //     message.error(JSON.stringify(data));
    //   }
    // });
    setEditModal(false);
    setLoader(false);
  }

  async function deleteOp() {

    setLoader(true);
    // await window.getDeliveryData.getData(statusToUpdate, "dummyurl");

    // window.getDeliveryData.receiveMessage((response: any) => {
    //   const { status, data } = JSON.parse(response);
    //   console.log("getDeliveryData status", status);
    //   console.log("getDeliveryData data", data);
    //   if (status == true) {
    //     message.success("Updated.");
    //   } else {
    //     message.error("Something went wrong while fetching delivery data.");
    //     message.error(JSON.stringify(data));
    //   }
    // });
    callDataSeeker();
  }

  const showConfirm = () => {
    confirm({
      title: 'Do you want to delete.',
      icon: <ExclamationCircleFilled />,
      // content: 'Some descriptions',
      onOk() {
        deleteOp();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    setSortField(sorter.field);
  };

  const columns = [
    {
      title: "Article",
      dataIndex: "article",
      ellipsis: false,
      render: (article: string) => {
        return (
          <span>{article || "-"}</span>
        );
      },
    },
    {
      title: "Book Ofc Name",
      dataIndex: "book_ofc_name",
      ellipsis: true,
      render: (book_ofc_name: string) => {
        return (
          <span>{book_ofc_name || "-"}</span>
        );
      },
    },
    {
      title: "Dest Ofc Name",
      dataIndex: "dest_ofc_name",
      ellipsis: false,
      render: (dest_ofc_name: string) => {
        return (
          <span>{dest_ofc_name || "-"}</span>
        );
      },
    },
    {
      title: "Book Date & Book Time",
      dataIndex: "book_date",
      ellipsis: false,
      render: (book_date: string) => {
        return (
          <span>{book_date || "-"}</span>
        );
      },
    },
    {
      title: "STATUS",
      dataIndex: "status",
      ellipsis: false,
      render: (status: string) => {
        return (
          <span>{status || "-"}</span>
        );
      },
      sorter: true
    },
    {
      title: "Office Name",
      dataIndex: "office_name",
      ellipsis: false,
      render: (office_name: string) => {
        return (
          <span>{office_name || "-"}</span>
        );
      },
      // sorter: true
    },
    {
      title: "Event Date",
      dataIndex: "event_date",
      ellipsis: false,
      render: (event_date: string) => {
        return (
          <span>{event_date || "-"}</span>
        );
      },
    },
    {
      title: "BAGID",
      dataIndex: "bagid",
      ellipsis: false,
      render: (bagid: string) => {
        return (
          <span>{bagid || "-"}</span>
        );
      },
    },
    {
      title: "RTS",
      dataIndex: "rts",
      ellipsis: false,
      render: (rts: string) => {
        return (
          <span>{rts || "-"}</span>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      ellipsis: false,
      render: (createdAt: string) => {
        return (
          <span>{createdAt || "-"}</span>
        );
      },
      sorter: true
    },
    {
      title: "Action",
      dataIndex: "action",
      ellipsis: false,
      with: 150,
      render: (_: any, row: any) => {
        return (
          <div>
            <span className='' onClick={() => { setSelectedData(row); setIsModalOpen(true); }}>
              <Button shape="circle" icon={<EyeOutlined />} />
            </span>
            <span className='ms-2' onClick={() => { setSelectedData(row); setEditModal(true); }}>
              <Button shape="circle" icon={<EditOutlined />} />
            </span>
            <span className='ms-2' onClick={() => { setSelectedData(row); showConfirm(); }}>
              <Button shape="circle" icon={<DeleteOutlined />} />
            </span>
          </div>
        );
      },
    },
  ];



  const onChange = (value: string) => {
    console.log(`selected ${value}`);
    setStatusFilter(value);
  };


  const onChangeDate = (dates: any, dateStrings: any) => {
    setDates(dateStrings);
    console.log('Selected Dates: ', dateStrings);
  };



  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const ObjectDisplay = ({ data }: any) => {
    return (
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        {Object.entries(data).map(([key, value]: any) => (
          <div key={key} className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-bold text-gray-700">{key}:</span>
            <span className="text-gray-600">{value}</span>
          </div>
        ))}
      </div>
    );
  };


  // console.log(TAG + " rowMeta ", rowMeta);
  // console.log(TAG + " rowData ", rowData);
  // console.log(TAG + " statusFilter ", statusFilter);
  // console.log(TAG + " dates ", dates);
  // console.log(TAG + " sortOrder ", sortOrder);
  // console.log(TAG + " sortField ", sortField);
  console.log(TAG + " selectedData ", selectedData);


  return (
    <div className='mt-3'>
      <Spin spinning={loader}>

        <div className='flex pb-5'>

          <div className='me-3'>
            <Input
              name="facility_id_search"
              id="facility_id_search"
              value={searchString}
              allowClear={true}
              onChange={(val) => { setSearchString(val.target.value) }}
              placeholder="Search facility id"
            />
          </div>

          <div className='me-3'>
            <Select
              className='w-[200px]'
              showSearch
              placeholder="Select status"
              optionFilterProp="label"
              // onSearch={onSearch}
              onChange={onChange}
              options={deliveryStatusDropOpt}
              value={statusFilter}
              allowClear={true}
            />
          </div>

          <div className="ms-3">
            <RangePicker
              // disabledDate={disabledDate}
              // disabledTime={disabledRangeTime}
              onChange={onChangeDate}
              format="DD-MM-YYYY"
            />
          </div>

          <div className='ms-3'>
            <Button
              type="primary"
              disabled={loader}
              onClick={filterOp}
            >Apply Filter</Button>
          </div>

        </div>

        <div className=''>
          <Table
            rowKey={"_id"}
            pagination={false}
            dataSource={rowData || []}
            columns={columns}
            onChange={handleTableChange}
          // onRow={(record) => {
          //   return {
          //     onClick: (event) => {
          //       event.stopPropagation();
          //       setSelectedData(record);
          //     },
          //   };
          // }}
          />
        </div>

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

      <div className='mt-10'>
        <Modal
          title="Delivery Data"
          open={isModalOpen}
          footer={false}
        >
          <div className='mt-10'>
            <ObjectDisplay data={selectedData} />
          </div>
          <div className='mt-3 flex justify-end'>
            <Button
              type="primary"
              disabled={loader}
              onClick={() => setIsModalOpen(false)}
            >Cancel</Button>
          </div>
        </Modal>
      </div>

      <div className='mt-10'>
        <Modal
          title="Delivery Data"
          open={editModal}
          footer={false}
        >
          <div className='flex items-center'>
            <div className=''>
              <Select
                className='w-[200px]'
                showSearch
                placeholder="Select status"
                optionFilterProp="label"
                // onSearch={onSearch}
                onChange={(val: any) => setStatusToUpdate(val?.value)}
                options={deliveryStatusDropOpt}
                value={statusToUpdate}
              />
            </div>
            <div className='ms-3'>
              <Button
                type="primary"
                disabled={loader}
                onClick={updateOp}
              >Update</Button>
            </div>
            <div className='ms-3'>
              <Button
                type="primary"
                disabled={loader}
                onClick={() => setEditModal(false)}
              >Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>

    </div>
  )
}

export default DeliveryTable;