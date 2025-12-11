import React from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function QRModal({ open, onClose, qrCodeData }) {
  return (
    console.log("QRModal render", qrCodeData),
    (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          Mã QR thanh toán
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <MDBox display="flex" justifyContent="center" alignItems="center">
            {qrCodeData ? (
              <img
                src={`data:image/png;base64,${qrCodeData}`}
                alt="QR Code"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              <MDTypography variant="body2">Đang tạo mã QR...</MDTypography>
            )}
          </MDBox>
        </DialogContent>
      </Dialog>
    )
  );
}

QRModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  qrCodeData: PropTypes.string,
};

export default QRModal;
