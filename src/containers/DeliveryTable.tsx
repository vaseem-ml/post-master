import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Pagination, message, Button, Spin, Table, Select, DatePicker, Modal, Input, Tag } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';

import { deliveryStatusDropOpt, deliveryStatusUi, colorFilterOpt } from '../utils/utils';
import { useEffectOnce } from '../components/update/useonc'
import { isEmpty } from 'lodash';
import type { TableColumnsType, TableProps } from 'antd';
type TableRowSelection<T extends object = object> = TableProps<T>['rowSelection'];

const TAG = "DeliveryTable: ";
const DeliveryTable = () => {

  const [loader, setLoader] = useState<boolean>(true);
  const [rowData, setRowData] = useState<any>([]);
  const [rowMeta, setRowMeta] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<any>();
  const [colorFilter, setColorFilter] = useState<any>();
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
  const navigate = useNavigate();

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    // console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const { RangePicker } = DatePicker;
  const { confirm } = Modal;


  useEffectOnce(() => {


    window.getExportData.receiveMessage(async (response: any) => {
      const { status, data } = JSON.parse(response);
      if (status == true) {
        message.success("Delivery data fetched.");
        try {
          const csv = Papa.unparse(data?.data);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, `delivery_data_${Date.now()}.csv`);
          setLoader(false);
        }
        catch (error) {
          message.error("Something went wrong while generating csv.");
          console.log(TAG + "error", error);
          setLoader(false);
        }
      } else {
        message.error("Something went wrong while fetching delivery data.");
        setLoader(false);
      }
    });

  });




  useEffect(() => {
    callDataSeeker();
  }, [payload, sortOrder, sortField]);

  const filterOp = () => {
    callDataSeeker();
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

  async function callDataSeeker() {
    console.log("callDataSeeker got called");

    let startDate = null, endDate = null, status = null, searchStr = null, color = null;
    if (isEmpty(dates) == false && dates?.length > 0 && dates?.[0] !== "" && dates?.[1] !== "") {
      startDate = dayjs(dates[0], "DD-MM-YYYY").format("YYYY-MM-DD");
      endDate = dayjs(dates[1], "DD-MM-YYYY").format("YYYY-MM-DD");
    }

    if (isEmpty(statusFilter) == false) {
      status = statusFilter;
    }

    if (isEmpty(colorFilter) == false) {
      color = colorFilter;
    }

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
      color: color
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
        setLoader(false);
      } else {
        message.error("Something went wrong while fetching delivery data.");
        message.error(JSON.stringify(data));
        setLoader(false);
      }

    });


  }

  async function callExportSeeker() {
    console.log("callExportSeeker got called");

    let startDate = null, endDate = null, status = null, searchStr = null, color = null;
    if (isEmpty(dates) == false && dates?.length > 0 && dates?.[0] !== "" && dates?.[1] !== "") {
      startDate = dayjs(dates[0], "DD-MM-YYYY").format("YYYY-MM-DD");
      endDate = dayjs(dates[1], "DD-MM-YYYY").format("YYYY-MM-DD");
    }

    if (isEmpty(statusFilter) == false) {
      status = statusFilter;
    }

    if (isEmpty(colorFilter) == false) {
      color = colorFilter;
    }

    if (searchString !== "") {
      searchStr = searchString;
    }

    let queryTable = {
      page: 1,
      limit: 10000000,
      startDate: startDate,
      endDate: endDate,
      status: status,
      search: searchStr,
      color: color
    }

    if (sortField == "" || sortField == undefined) {
      status = sortField;
      Object.assign(queryTable, { sort: null })
    } else {
      Object.assign(queryTable, { sort: { [sortField]: sortOrder === "asc" ? 1 : -1 } })
    }

    console.log(TAG + "queryTable", queryTable);

    try {
      await window.getExportData.getData(queryTable, "dummyurl");
    }
    catch (error) {
      message.error("Something went wrong while generating csv.");
      setLoader(false);
    }

  }



  async function updateOp() {

    // console.log(TAG + " update call ", selectedData);
    // console.log(TAG + " statusToUpdate ", statusToUpdate);
    const updateObj = { article: selectedData?.article, status: statusToUpdate }
    // setLoader(true);
    await window.updateDelivery.updateCall(updateObj, "dummyurl");

    window.updateDelivery.receiveMessage((response: any) => {
      const { status, data } = JSON.parse(response);
      // console.log("updateDelivery status", status);
      // console.log("updateDelivery data", data);
      if (status == true) {
        message.success("Updated.");
        callDataSeeker();
      } else {
        message.error("Something went wrong while updating.");
      }
      setEditModal(false);
      setSelectedData(null);
      setStatusToUpdate(undefined);
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
        callDataSeeker();
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
    callExportSeeker();
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
      sorter: true
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
      sorter: true
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
      }
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
      sorter: true
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
      sorter: true
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
      sorter: true
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

          <div className='me-3'>
            <Select
              className='w-[200px]'
              showSearch
              placeholder="Select color"
              optionFilterProp="label"
              // onSearch={onSearch}
              onChange={(val: any) => setColorFilter(val)}
              options={colorFilterOpt}
              value={colorFilter}
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