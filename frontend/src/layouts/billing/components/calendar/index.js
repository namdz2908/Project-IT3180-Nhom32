import * as React from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import updateLocale from "dayjs/plugin/updateLocale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import TextField from "@mui/material/TextField";
dayjs.extend(updateLocale);
// dayjs.updateLocale("vi", {
//   weekdaysShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
// });
// dayjs.locale('vi');
export default function Calendar() {
  const [value, setValue] = React.useState(dayjs());

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        openTo="day"
        value={value}
        onChange={(newValue) => setValue(newValue)}
        renderInput={(params) => <TextField {...params} />}
      />
    </LocalizationProvider>
  );
}
