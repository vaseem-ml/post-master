import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Pagination, message, Button, Spin, Table, Select, DatePicker, Modal, Input, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

import { deliveryStatusDropOpt, deliveryStatusUi } from '../utils/utils';
import { isEmpty } from 'lodash';
import type { TableColumnsType, TableProps } from 'antd';
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

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

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    // console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const { RangePicker } = DatePicker;
  const { confirm } = Modal;

  useEffect(() => {
    callDataSeeker(undefined, undefined);
  }, [payload, sortOrder, sortField]);

  const filterOp = () => {
    callDataSeeker(undefined, undefined);
  }

  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    // selections: [
    //   Table.SELECTION_ALL,
    //   Table.SELECTION_INVERT,
    //   Table.SELECTION_NONE,
    //   {
    //     key: 'odd',
    //     text: 'Select Odd Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return false;
    //         }
    //         return true;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    //   {
    //     key: 'even',
    //     text: 'Select Even Row',
    //     onSelect: (changeableRowKeys) => {
    //       let newSelectedRowKeys = [];
    //       newSelectedRowKeys = changeableRowKeys.filter((_, index) => {
    //         if (index % 2 !== 0) {
    //           return true;
    //         }
    //         return false;
    //       });
    //       setSelectedRowKeys(newSelectedRowKeys);
    //     },
    //   },
    // ],
  };

  function esitCal(calledWith: any) {
    if (isEmpty(calledWith) == true || isEmpty(calledWith?.book_date) == true || calledWith?.book_date == "") {
      return "_";
    }

    try {
      const dateOnly = dayjs(calledWith?.book_date).format('YYYY-MM-DD');
      if (isEmpty(calledWith?.masterData?.d2) == false) {
        let dataParsed: any = '';
        try {
          dataParsed = parseInt(calledWith?.masterData?.d2);
        } catch (error) {
          return "_";
        }
        const newDate = dayjs(dateOnly).add(dataParsed, 'day').format('DD-MM-YYYY');
        return newDate;
      } else {
        const newDate = dayjs(dateOnly).add(3, 'day').format('DD-MM-YYYY');
        return newDate;
      }
    } catch (error) {
      return "_";
    }

  }

  async function callDataSeeker(cpage: any, cpagesize: any) {
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
      page: cpage ? cpage : payload?.page,
      limit: cpagesize ? cpagesize : payload?.page_size,
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

        if (cpage !== undefined && cpagesize !== undefined) {
          const exportToCSV = (data: any, filename: any) => {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, `${filename}.csv`);
            setLoader(false);
          };
          exportToCSV(data?.data, "delivery_data");
        } else {
          setRowData(data?.data);
          setRowMeta(data?.meta);
          setLoader(false);
        }
      } else {
        message.error("Something went wrong while fetching delivery data.");
        message.error(JSON.stringify(data));
        setLoader(false);
      }

    });


  }

  async function updateOp() {

    // console.log(TAG + " update call ", selectedData);
    // console.log(TAG + " statusToUpdate ", statusToUpdate);
    const updateObj = {
      article: selectedData?.article,
      status: statusToUpdate
    }
    // setLoader(true);
    await window.updateDelivery.updateCall(updateObj, "dummyurl");

    window.updateDelivery.receiveMessage((response: any) => {
      const { status, data } = JSON.parse(response);
      // console.log("updateDelivery status", status);
      // console.log("updateDelivery data", data);
      if (status == true) {
        message.success("Updated.");
      } else {
        message.error("Something went wrong while updating.");
      }
      setEditModal(false);
      setSelectedData(null);
      setStatusToUpdate(undefined);
      callDataSeeker(undefined, undefined);
    });

  }

  async function deleteOp() {

    setLoader(true);
    // console.log(TAG + " delete call ", selectedRowKeys);
    await window.deleteDelivery.deleteCall({ ids: selectedRowKeys }, "dummyurl");

    window.deleteDelivery.receiveMessage((response: any) => {
      const { status, data } = JSON.parse(response);
      // console.log("getDeliveryData status", status);
      // console.log("getDeliveryData data", data);
      if (status == true) {
        message.success("Deleted.");
        callDataSeeker(undefined, undefined);
        setSelectedRowKeys([]);
      } else {
        message.error("Something went wrong while deleting.");
        // message.error(JSON.stringify(data));
        setLoader(false);
      }
    });
  }

  async function exportOp() {
    setLoader(true);
    callDataSeeker(1, 10000000);
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
      width: 200,
      render: (status: string, row: any) => {
        return (
          // <span className='w-fit'>{status ? <Tag color={deliveryStatusUi(status).color} > {status} </Tag> : "-"}</span>
          <span className='w-fit'>{status ? <Tag color={row?.color || ""} > {status} </Tag> : "-"}</span>
          // <Tag />
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
      title: "EDD",
      dataIndex: "edd",
      ellipsis: false,
      render: (edd: string) => {
        return (
          <span>{edd || "-"}</span>
        );
      },
    },
    {
      title: "Exceeded days",
      dataIndex: "exceeded_days",
      ellipsis: false,
      render: (exceeded_days: string, row: any) => {
        return (
          // <span>{esitCal(row)}</span>
          <span>{exceeded_days}</span>
        );
      },
    },
    // {
    //   title: "Created At",
    //   dataIndex: "createdAt",
    //   ellipsis: false,
    //   render: (createdAt: string) => {
    //     return (
    //       <span>{createdAt || "-"}</span>
    //     );
    //   },
    //   sorter: true
    // },
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
            <span className='ms-2' onClick={() => { setSelectedData(row); setStatusToUpdate(undefined); setEditModal(true); }}>
              <Button shape="circle" icon={<EditOutlined />} />
            </span>
            {/* <span className='ms-2' onClick={() => { setSelectedData(row); showConfirm(); }}>
              <Button shape="circle" icon={<DeleteOutlined />} />
            </span> */}
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



  const ObjectDisplay = ({ data }: any) => {
    return (
      <div className="max-w-md p-6 mx-auto bg-white rounded-md shadow-md">
        {Object.entries(data).map(([key, value]: any) => (
          <>
            {key !== "masterData" ?
              <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-bold text-gray-700">{key}:</span>
                <span className="text-gray-600">{value}</span>
              </div>
              : ""}
          </>
        ))}
      </div>
    );
  };


  // console.log(TAG + " rowMeta ", rowMeta);
  console.log(TAG + " rowData ", rowData);
  // console.log(TAG + " statusFilter ", statusFilter);
  // console.log(TAG + " dates ", dates);
  // console.log(TAG + " sortOrder ", sortOrder);
  // console.log(TAG + " sortField ", sortField);
  // console.log(TAG + " selectedData ", selectedData);
  // console.log(TAG + " selectedRowKeys ", selectedRowKeys);
  // console.log(TAG + " statusToUpdate ", statusToUpdate);


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

          <div className='ms-3'>
            <Button
              type="primary"
              disabled={selectedRowKeys?.length ? false : true}
              // disabled={}
              onClick={showConfirm}
            >Delete</Button>
          </div>

          <div className='ms-3'>
            <Button
              type="primary"
              disabled={loader || rowData?.length ? false : true}
              // disabled={}
              onClick={exportOp}
            >Export</Button>
          </div>

        </div>

        <div className=''>
          <Table
            rowKey={"_id"}
            pagination={false}
            dataSource={rowData || []}
            columns={columns}
            onChange={handleTableChange}
            rowSelection={rowSelection}
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

        <div className='flex justify-center mt-5'>
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
          <div className='flex justify-end mt-3'>
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
                onChange={(val: any) => setStatusToUpdate(val)}
                options={deliveryStatusDropOpt}
                value={statusToUpdate || null}
                id="caller"
                key="caller"
                defaultValue={null}
              // selected={}
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