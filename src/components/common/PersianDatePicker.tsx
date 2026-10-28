
import type { ComponentType } from "react";
import DatePickerImport from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CalendarDays } from "lucide-react";

type PersianDatePickerProps = {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  disabled?: boolean;
  required?: boolean;
  inputId?: string;
};

type DatePickerProps = {
  value?: Date | "";
  onChange: (date: { toDate: () => Date } | null) => void;
  calendar: typeof persian;
  locale: typeof persian_fa;
  format: string;
  calendarPosition: string;
  minDate?: Date;
  disabled?: boolean;
  inputId?: string;
  required?: boolean;
  placeholder?: string;
  editable?: boolean;
  inputClass?: string;
  containerClassName?: string;
};

const DatePickerComponent = (
  (
    DatePickerImport as unknown as {
      default?: { default?: ComponentType<DatePickerProps> } | ComponentType<DatePickerProps>;
    }
  )?.default &&
  typeof (
    DatePickerImport as unknown as {
      default: unknown;
    }
  ).default === "object"
    ? (
        DatePickerImport as unknown as {
          default: { default?: ComponentType<DatePickerProps> } & ComponentType<DatePickerProps>;
        }
      ).default.default ??
      (
        DatePickerImport as unknown as {
          default: ComponentType<DatePickerProps>;
        }
      ).default
    : DatePickerImport
) as ComponentType<DatePickerProps>;

function toGregorianDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  minDate,
  disabled = false,
  required = false,
  inputId,
}: PersianDatePickerProps) {
  const selectedDate = value
    ? new Date(`${value}T12:00:00`)
    : null;

  const minimumDate = minDate
    ? new Date(`${minDate}T12:00:00`)
    : undefined;

  return (
    <div className="relative w-full" dir="rtl">
      <DatePickerComponent
        value={selectedDate ?? ""}
        onChange={(date) => {
          if (!date) {
            onChange("");
            return;
          }

          onChange(toGregorianDate(date.toDate()));
        }}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        minDate={minimumDate}
        disabled={disabled}
        inputId={inputId}
        required={required}
        placeholder={placeholder}
        editable={false}
        inputClass="w-full rounded-xl border border-slate-200 bg-white py-3 pr-11 pl-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        containerClassName="w-full"
      />

      <CalendarDays
        size={19}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
      />
    </div>
  );
}

export default PersianDatePicker;
