import Picker from "react-mobile-picker";

export type ReminderTimeValue = {
  hour: string;
  minute: string;
  period: "am" | "pm";
};

const reminderHours = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

const reminderMinutes = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

const reminderPeriods = ["am", "pm"] as const;

type ReminderTimePickerProps = {
  value: ReminderTimeValue;
  onChange: (value: ReminderTimeValue) => void;
};

export function parseReminderTime(value: string): ReminderTimeValue {
  const fallback: ReminderTimeValue = {
    hour: "11",
    minute: "30",
    period: "am",
  };

  const [timePart, periodPart] = value.trim().toLowerCase().split(" ");
  const [hourPart, minutePart] = (timePart ?? "").split(":");

  return {
    hour: reminderHours.includes(hourPart) ? hourPart : fallback.hour,
    minute: reminderMinutes.includes(minutePart) ? minutePart : fallback.minute,
    period: reminderPeriods.includes(periodPart as "am" | "pm")
      ? (periodPart as "am" | "pm")
      : fallback.period,
  };
}

export function parseOptionalReminderTime(value?: string | null) {
  return value ? parseReminderTime(value) : parseReminderTime("11:30 am");
}

export function formatReminderTime(value: ReminderTimeValue) {
  return `${value.hour}:${value.minute} ${value.period}`;
}

export function ReminderTimePicker({
  value,
  onChange,
}: ReminderTimePickerProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white px-2 py-4">
      <Picker
        value={value}
        onChange={(nextValue) => onChange(nextValue as ReminderTimeValue)}
        wheelMode="natural"
        height={180}
        itemHeight={40}
      >
        <Picker.Column name="hour">
          {reminderHours.map((hour) => (
            <Picker.Item key={hour} value={hour}>
              {({ selected }) => (
                <div
                  className={`text-center text-base transition-colors ${
                    selected
                      ? "font-bold text-[#183C59]"
                      : "font-medium text-[#8AA3B8]"
                  }`}
                >
                  {hour}
                </div>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
        <Picker.Column name="minute">
          {reminderMinutes.map((minute) => (
            <Picker.Item key={minute} value={minute}>
              {({ selected }) => (
                <div
                  className={`text-center text-base transition-colors ${
                    selected
                      ? "font-bold text-[#183C59]"
                      : "font-medium text-[#8AA3B8]"
                  }`}
                >
                  {minute}
                </div>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
        <Picker.Column name="period">
          {reminderPeriods.map((period) => (
            <Picker.Item key={period} value={period}>
              {({ selected }) => (
                <div
                  className={`text-center text-base uppercase transition-colors ${
                    selected
                      ? "font-bold text-[#183C59]"
                      : "font-medium text-[#8AA3B8]"
                  }`}
                >
                  {period}
                </div>
              )}
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
    </div>
  );
}
