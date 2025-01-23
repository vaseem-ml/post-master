import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, message, Button, Spin, Table } from 'antd';
import { isEmpty } from 'lodash';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import type { UploadFile, UploadProps } from 'antd';

import { deliveryTableColumn, deliveryKeyMapping, renameKeys, deliverySheet, removeEmptyArrays, removeEmptyObjects, containsAllElements, allowedFile } from '../utils/utils';

declare global {
  interface Window {
    loginAPI: {
      login: (newUserJson: any, apiurl: string) => Promise<any>;
      receiveMessage: (callback: (message: any) => void) => void;
    };
    [key: string]: any;
  }
}

const TAG = "Delivery: ";
function Delivery() {

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const navigate = useNavigate();

  async function calledd(newUserJson: any) {

    console.log(TAG + "final data to submit ");
    console.log(newUserJson);

    setLoader(true);
    await window.insertDeliveryData.insertData(newUserJson, "dummyurl");

    window.insertDeliveryData.receiveMessage((response: any) => {
      // console.log(TAG + "api call response");
      // console.log(response);
      const { status, data } = JSON.parse(response);
      console.log(TAG + "status", status);
      console.log(TAG + "data", data);
      navigate(0);

      if (status == true) {
        message.success("Details inserted.");
      } else {
        message.error("Something went wrong while saving data.");
        message.error(JSON.stringify(data));
      }

    });

    setLoader(false);

  }

  const resetFileUp = () => {
    setFileList([]);
    setLoader(false);
  }

  function hasDuplicates(arr: any) {
    return new Set(arr).size !== arr.length;
  }

  const beforeUpload = (file: File) => {
    // console.log(file?.type);
    return false;
  };

  function checkPrimaryKeyThere(arr: any) {
    return arr.every((item: any) => item["Article"] && item["Article"].trim() !== '');
  }

  function hasUniqueArticleIds(data: any) {
    const facilityIds = data.map((item: any) => item.article);
    const uniqueFacilityIds = new Set(facilityIds);
    return facilityIds.length === uniqueFacilityIds.size;
  }

  const handleChange: UploadProps['onChange'] = (info: any) => {

    // console.log(TAG + " file.size", info);
    const isLt25M = info.file.size < (25 * 1024 * 1024);
    if (!isLt25M) {
      message.error(`file must smaller than 25MB!`);
      return;
    }

    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-2);
    newFileList = newFileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(newFileList);
  };

  const propsIn: any = {
    accept: allowedFile,
    name: "file",
    onChange: handleChange,
    multiple: false,
    tooltip: false,
    beforeUpload: beforeUpload
  };

  const handleFileParse = (event: any) => {

    const reader = new FileReader();
    const file: any = fileList?.[0]?.originFileObj;

    reader.onload = (e: any) => {

      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
      const keys: any = json[0];

      // const jsonData: any = json.slice(1).map((row: any) =>
      //   row.reduce((acc: any, value: any, index: any) => {
      //     acc[keys[index]] = value !== undefined ? value : "";
      //     return acc;
      //   }, {})
      // );

      // const jsonData = json.slice(1).map((row: any) =>
      //   row.reduce((acc, value, index) => {
      //     if (keys[index] && keys[index].toLowerCase().includes('date')) {
      //       // Assuming the date is in the format "DD/MM/YYYY"
      //       if (typeof value === 'number') {
      //         value = XLSX.SSF.format('dd/mm/yyyy', value); // Format numeric date correctly
      //       }
      //       const [day, month, year] = value.split('/');
      //       acc[keys[index]] = new Date(`${year}-${month}-${day}`);
      //     } else {
      //       acc[keys[index]] = value !== undefined ? value : "";
      //     }
      //     return acc;
      //   }, {})
      // );

      const jsonData = json.slice(1).map((row: any) =>
        row.reduce((acc: any, value: any, index: any) => {
          if (keys[index] && keys[index].toLowerCase().includes('date')) {
            // Assuming the date is in the format "DD/MM/YYYY"
            if (typeof value === 'number') {
              value = XLSX.SSF.format('dd/mm/yyyy', value); // Format numeric date correctly
            }
            const [day, month, year] = value.split('/');
            acc[keys[index]] = new Date(`${year}-${month}-${day}`);
          } else if (keys[index] && keys[index].toLowerCase().includes('time')) {
            // Handle time format "HH:MM:SS"
            if (typeof value === 'number') {
              value = XLSX.SSF.format('hh:mm:ss', value); // Format numeric time correctly
            }
            acc[keys[index]] = value;
          } else {
            acc[keys[index]] = value !== undefined ? value : "";
          }
          return acc;
        }, {})
      );

      console.log(TAG + " jsonData jsonData ", jsonData);

      if (isEmpty(jsonData) == true || isEmpty(jsonData?.[0]) == true || isEmpty(keys) == true) {
        message.error("file is empty.");
        resetFileUp();
        return;
      }

      // console.log(TAG + " keys ", keys);
      // console.log(TAG + " keys ", typeof (keys));

      if (typeof (keys) !== "object") {
        message.error("Something is wrong.");
        resetFileUp();
        return;
      }

      const dupliExist = hasDuplicates(keys);
      if (dupliExist === true) {
        message.error("File contain duplicat header.");
        resetFileUp();
        return;
      }

      const result: any = containsAllElements(keys, deliverySheet);
      if (result == true) {

      } else {
        message.error("File not contain required headers.");
        message.error(`Required headers are ${deliverySheet.join(', ')}.`);
        resetFileUp();
        return;
      }

      const trimmed2 = removeEmptyArrays(jsonData);

      // const trimmed2 = removeEmptyObjects(trimmed);

      // console.log(TAG + " values ", values);
      // console.log(TAG + " trimmed ", trimmed);
      // console.log(TAG + " trimmed2 ", trimmed2);

      const facilityThere = checkPrimaryKeyThere(trimmed2);

      if (facilityThere === false) {
        message.error("Acticle ID is empty.");
        resetFileUp();
        return;
      }

      //update object key to column names
      const updatedKeys = trimmed2.map((item: any) => renameKeys(item, deliveryKeyMapping));


      //checking if all facility id is unique
      const isUniqPrimary = hasUniqueArticleIds(updatedKeys)
      if (isUniqPrimary === false) {
        message.error("Article is not unique.");
        resetFileUp();
        return;
      }


      //removing unnecessary keys
      const onlyDbKeys = updatedKeys.map((item: any) => {
        return deliveryTableColumn.reduce((acc: any, key) => {
          if (key in item) {
            acc[key] = item[key];
          }
          return acc;
        }, {});
      });


      //adding db keys
      onlyDbKeys.forEach((item: any) => {
        item.is_deleted = false;
        item.is_active = true;
      });

      console.log(TAG + "final data to submit ");
      console.log(onlyDbKeys);

      calledd(onlyDbKeys);

    };


    reader.readAsArrayBuffer(file);

  }

  // console.log(TAG + " fileList ", fileList);

  return (
    <Spin spinning={loader}>
      <div className='w- p-3'>
        <div className=' w-full'>

          <div className="text-[#000000] text-[18px]">Upload Delivery Data</div>

          <div className='boradcast-contact mt-5'>
            <Upload.Dragger
              {...propsIn}
              fileList={fileList}
              disabled={loader}
            >
              <div className="flex text-[#1E48F7] text-[16px] justify-center items-center font-semibold">
                <div> <PlusCircleOutlined color="#1E48F7" className="text-[16px] font-semibold" /> </div>
                <div className="ms-1" >SELECT FILE</div>
              </div>
              <div className="text-[#1F212380] text-[14px] mt-2">Accepted file type:  {allowedFile}</div>
              <div className="text-[#1F212380] text-[14px] mt-2">Accepted file size:  25mb</div>
            </Upload.Dragger>
          </div>

          <div className='flex justify-end'>
            <Button
              type="primary"
              className='mt-5'
              disabled={fileList?.length ? false : true}
              onClick={handleFileParse}
            >Submit</Button>
          </div>

        </div>
      </div>
    </Spin>
  )
}

export default Delivery;