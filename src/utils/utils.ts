
export const masterTableColumn = [
  "pincode",
  "facility_id",
  "booking_office",
  "office_name",
  "division",
  "region",
  "d1",
  "d2",
  "is_deleted",
  "is_active",
]


export const newKeysMapping = {
  "Pincode No": "pincode",
  "Facility ID": "facility_id",
  "Booking office": "booking_office",
  "Name of Office": "office_name",
  "Division": "division",
  "Region": "region",
  "D1": "d1",
  "D2": "d2",
  "is_deleted": "is_deleted",
  "is_active": "is_active"
};

export const renameKeys = (obj: any, newKeys: any) => {
  const keyValues = Object.keys(obj).map(key => {
    const newKey = newKeys[key] || key;
    return { [newKey]: obj[key] };
  });
  return Object.assign({}, ...keyValues);
};


export const requiredElements = [
  "Pincode No",
  "Facility ID",
  "Booking office",
  "Name of Office",
  "Division",
  "Region",
  "D1",
  "D2"
];

export function removeEmptyArrays(arr: any) {
  return arr.filter((item: any) => !(Array.isArray(item) && item.length === 0));
}

export function removeEmptyObjects(arr: any) {
  return arr.filter((item: any) => Object.keys(item).length !== 0);
}

export function containsAllElements(arr: any, elements: any) {
  return elements.every((element: any) => arr.includes(element));
}

export const allowedFile = ".xls, .xlsx";


export const deliverySheet = [
  "Article",
  "Booking",
  "Track",
  "COD",
  "Book Ofc",
  "Book Ofc Name",
  "Dest Ofc ID",
  "Dest Ofc Name",
  "BOOK_ID",
  "Article Type",
  "Weight",
  "Book Date",
  "Book Time",
  "Tariff",
  "Prepaid Value",
  "Sender Name",
  "Sender City",
  "Sender Mobile",
  "Receiver Name",
  "Recevier Addr1",
  "Recevier Addr2",
  "Recevier Addr3",
  "Recevier City",
  "Receiver Phone",
  "Receiver PIN",
  "INS Value",
  "Customer ID",
  "Contract",
  "Value",
  "Service",
  "EMO Message",
  "User ID",
  "User Name",
  "STATUS",
  "Office ID",
  "Office Name",
  "Event Date",
  "Event Time",
  "IPVS Article Type",
  "BAGID",
  "RTS",
];

export const deliveryKeyMapping = {
  "Article": "article",
  "Booking": "booking",
  "Track": "track",
  "COD": "cod",
  "Book Ofc": "book_ofc",
  "Book Ofc Name": "book_ofc_name",
  "Dest Ofc ID": "dest_ofc_id",
  "Dest Ofc Name": "dest_ofc_name",
  "BOOK_ID": "book_id",
  "Article Type": "article_type",
  "Weight": "weight",
  "Book Date": "book_date",
  "Book Time": "book_time",
  "Tariff": "tariff",
  "Prepaid Value": "prepaid_value",
  "Sender Name": "sender_name",
  "Sender City": "sender_city",
  "Sender Mobile": "sender_mobile",
  "Receiver Name": "receiver_name",
  "Recevier Addr1": "recevier_addr1",
  "Recevier Addr2": "recevier_addr2",
  "Recevier Addr3": "recevier_addr3",
  "Recevier City": "receiver_city",
  "Receiver Phone": "receiver_phone",
  "Receiver PIN": "receiver_pin",
  "INS Value": "ins_value",
  "Customer ID": "customer_id",
  "Contract": "contract",
  "Value": "value",
  "Service": "service",
  "EMO Message": "emo_message",
  "User ID": "user_id",
  "User Name": "user_name",
  "STATUS": "status",
  "Office ID": "office_id",
  "Office Name": "office_name",
  "Event Date": "event_date",
  "Event Time": "event_time",
  "IPVS Article Type": "ipvs_article_type",
  "BAGID": "bagid",
  "RTS": "rts"
}


export const deliveryTableColumn = [
  "article",
  "booking",
  "track",
  "cod",
  "book_ofc",
  "book_ofc_name",
  "dest_ofc_id",
  "dest_ofc_name",
  "book_id",
  "article_type",
  "weight",
  "book_date",
  "book_time",
  "tariff",
  "prepaid_value",
  "sender_name",
  "sender_city",
  "sender_mobile",
  "receiver_name",
  "recevier_addr1",
  "recevier_addr2",
  "recevier_addr3",
  "receiver_city",
  "receiver_phone",
  "receiver_pin",
  "ins_value",
  "customer_id",
  "contract",
  "value",
  "service",
  "emo_message",
  "user_id",
  "user_name",
  "status",
  "office_id",
  "office_name",
  "event_date",
  "event_time",
  "ipvs_article_type",
  "bagid",
  "rts"
]


export const deliveryStatus = [
  "Bag Closed",
  "Bag Dispatch Cancel",
  "Bag Dispatched",
  "Bag Loaded into Another Bag",
  "Bag Opened",
  "Bag Received",
  "Bag Received At Destination",
  "Item Beat Dispatch",
  "Item Delivered",
  "Item Dispatched to BO",
  "Item Handled Manually",
  "Item OnHold",
  "Item Redirect",
  "Item Return"
]
export const deliveryStatusUi = (status: string): any => {
  if (status === "Bag Closed") {
    return { color: "magenta" }
  }
  if (status === "Bag Dispatch Cancel") {
    return { color: "red" }
  }
  if (status === "Bag Dispatched") {
    return { color: "volcano" }
  }
  if (status === "Bag Loaded into Another Bag") {
    return { color: "orange" }
  }
  if (status === "Bag Opened") {
    return { color: "gold" }
  }
  if (status === "Bag Received") {
    return { color: "lime" }
  }
  if (status === "Bag Received At Destination") {
    return { color: "green" }
  }
  if (status === "Item Beat Dispatch") {
    return { color: "cyan" }
  }
  if (status === "Item Delivered") {
    return { color: "blue" }
  }
  if (status === "Item Dispatched to BO") {
    return { color: "geekblue" }
  }
  if (status === "Item Handled Manually") {
    return { color: "purple" }
  }
  if (status === "Item OnHold") {
    return { color: "#2db7f5" }
  }
  if (status === "Item Redirect") {
    return { color: "#87d068" }
  }
  if (status === "Item Return") {
    return { color: "#108ee9" }
  } else {
    return { color: "" }
  }
}

export const deliveryStatusDropOpt = [
  { label: "Bag Closed", value: "Bag Closed" },
  { label: "Bag Dispatch Cancel", value: "Bag Dispatch Cancel" },
  { label: "Bag Dispatched", value: "Bag Dispatched" },
  { label: "Bag Loaded into Another Bag", value: "Bag Loaded into Another Bag" },
  { label: "Bag Opened", value: "Bag Opened" },
  { label: "Bag Received", value: "Bag Received" },
  { label: "Bag Received At Destination", value: "Bag Received At Destination" },
  { label: "Item Beat Dispatch", value: "Item Beat Dispatch" },
  { label: "Item Delivered", value: "Item Delivered" },
  { label: "Item Dispatched to BO", value: "Item Dispatched to BO" },
  { label: "Item Handled Manually", value: "Item Handled Manually" },
  { label: "Item OnHold", value: "Item OnHold" },
  { label: "Item Redirect", value: "Item Redirect" },
  { label: "Item Return", value: "Item Return" }
]


