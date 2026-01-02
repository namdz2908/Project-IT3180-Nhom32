import axios from "axios";

const API_URL = "http://localhost:8080";

// lấy danh sách hóa đơn
export const getAllInvoices = async () => {
  const response = await axios.get(`${API_URL}/invoices/all`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// lấy hóa đơn theo apartmentId
export const getInvoice = async (id = null) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("response la: ---------------------", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
    return null;
  }
};

// lấy số đơn vị trên 1 đơn theo type
export const getFeeByType = async (type = null) => {
  try {
    const response = await axios.get(`${API_URL}/fees/${type}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu fee:", error);
    return null;
  }
};

// cập nhật tổng hóa đơn căn hộ
export const updateTotalInvoiceOfApartment = async (apartmentId) => {
  try {
    const response = await axios.put(`${API_URL}/apartment/${apartmentId}/total`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật tổng hóa đơn của căn hộ:", error);
    return null;
  }
};

// Cập nhật thông tin hóa đơn
export const updateInvoice = async (id, invoiceDTO) => {
  try {
    const response = await axios.put(`${API_URL}/invoices/${id}`, invoiceDTO, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật hóa đơn:", error);
    return null;
  }
};

// lấy hóa đơn theo apartmentID và type
export const getInvoiceByApartmentAndType = async (apartmentId = null, type = null) => {
  try {
    const response = await axios.get(`${API_URL}/invoices`, {
      params: apartmentId && type ? { apartmentId, type } : {},
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
    return null;
  }
};

// tạo hóa đơn mới
export const createInvoice = async (invoiceDTO) => {
  const response = await axios.post(`${API_URL}/invoices`, invoiceDTO, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return response.data;
};

// Xóa hóa đơn theo id
export const deleteInvoice = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/invoices/delete`, {
      params: { id },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hóa đơn:", error);
    return null;
  }
};

// Tạo mã QR
export const QRcode = async (paymentToken) => {
  console.log("paymentToken trong api.js la : ---------------------", paymentToken);
  try {
    const response = await axios.get(`${API_URL}/invoices/getQRCode/${paymentToken}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("response la: ---------------------", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    return null;
  }
};

// Tạo PDF
export const createPDF = async (apartmentId, id, isQR) => {
  console.log("paymentToken trong api.js la : ---------------------", id);
  try {
    const response = await axios.get(
      `${API_URL}/apartment/${apartmentId}/bill?id=${id}&isQR=${isQR}`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      }
    );
    console.log("response la: ---------------------", response.data);
    const file = new Blob([response.data], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(file);
    return fileURL;
  } catch (error) {
    console.error("Lỗi khi tạo PDF:", error);
    return null;
  }
};

// Thanh toán hóa đơn
export const payBill = async (paymentToken) => {
  try {
    const response = await axios.put(`${API_URL}/invoices/complete-payment/${paymentToken}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    return null;
  }
};

// Lấy contribution qua apartmentId
export const getContribution = async (apartmentId) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/contribution/${apartmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu contribution:", error);
    return null;
  }
};

export const getInvoiceNotContribution = async (apartmentId) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/not-contribution/${apartmentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
    return null;
  }
};

// Lấy danh sách hóa đơn sắp đến hạn
export const getUpcomingInvoices = async (daysAhead = 7) => {
  try {
    const response = await axios.get(`${API_URL}/invoices/upcoming`, {
      params: { daysAhead },
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy invoices sắp đến hạn:", error);
    return [];
  }
};
