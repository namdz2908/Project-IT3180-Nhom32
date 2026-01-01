import * as React from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import updateLocale from "dayjs/plugin/updateLocale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker, PickersDay } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

dayjs.extend(updateLocale);

const StyledPickersDay = styled(PickersDay, {
  shouldForwardProp: (props) => props !== "hasDueDate",
})(({ theme, hasDueDate }) => ({
  ...(hasDueDate && {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 6,
      height: 6,
      backgroundColor: theme.palette.error.main,
      borderRadius: "50%",
      border: `1px solid ${theme.palette.background.paper}`,
      zIndex: 1,
    },
  }),
}));

function Calendar({ revenues = [], daysAhead = 7 }) {
  const [value, setValue] = React.useState(dayjs());
  const [open, setOpen] = React.useState(false);
  const [selectedDayRevenues, setSelectedDayRevenues] = React.useState([]);

  const getUpcomingDueDates = React.useMemo(() => {
    const now = dayjs();
    const endDate = now.add(daysAhead, "day");

    return revenues
      .map((revenue) => dayjs(revenue.dueDate))
      .filter((date) => date.isValid())
      .map((date) => date.format("YYYY-MM-DD"))
      .filter((date, index, self) => self.indexOf(date) === index);
  }, [revenues, daysAhead]);

  const handleDateChange = (newValue) => {
    setValue(newValue);
    const dateKey = newValue.format("YYYY-MM-DD");

    // Tìm các hóa đơn có ngày đến hạn trùng với ngày vừa click
    const dayRevenues = revenues.filter((r) => dayjs(r.dueDate).format("YYYY-MM-DD") === dateKey);

    if (dayRevenues.length > 0) {
      setSelectedDayRevenues(dayRevenues);
      setOpen(true);
    }
  };

  const renderDay = (day, selectedDates, pickersDayProps) => {
    const dateKey = day.format("YYYY-MM-DD");
    const hasDueDate = getUpcomingDueDates.includes(dateKey);

    return <StyledPickersDay {...pickersDayProps} hasDueDate={hasDueDate} disableMargin={true} />;
  };

  return (
    <MDBox>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker
          displayStaticWrapperAs="desktop"
          openTo="day"
          value={value}
          onChange={handleDateChange}
          renderDay={renderDay}
          renderInput={(params) => <TextField {...params} />}
          slots={{
            textField: TextField,
          }}
        />
      </LocalizationProvider>

      {/* Bảng thông tin chi tiết hóa đơn khi click */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MDTypography variant="h6">
            Hóa đơn đến hạn ngày {value.format("DD/MM/YYYY")}
          </MDTypography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ display: "table-header-group" }}>
                <TableRow>
                  <TableCell>Căn hộ</TableCell>
                  <TableCell>Loại phí</TableCell>
                  <TableCell align="right">Số tiền (VNĐ)</TableCell>
                  <TableCell align="center">Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDayRevenues.map((revenue) => (
                  <TableRow key={revenue.id}>
                    <TableCell>{revenue.apartmentId}</TableCell>
                    <TableCell>{revenue.type}</TableCell>
                    <TableCell align="right">
                      {new Intl.NumberFormat("vi-VN").format(revenue.total)}
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" color="error" fontWeight="bold">
                        {revenue.status}
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <MDBox p={2} display="flex" justifyContent="flex-end">
          <MDButton color="info" variant="gradient" onClick={() => setOpen(false)}>
            Đóng
          </MDButton>
        </MDBox>
      </Dialog>
    </MDBox>
  );
}

Calendar.propTypes = {
  revenues: PropTypes.array,
  daysAhead: PropTypes.number,
};

export default Calendar;
