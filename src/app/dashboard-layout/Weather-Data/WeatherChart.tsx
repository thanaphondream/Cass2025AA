import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  // Removed NameType and ValueType from here
} from "recharts";
// FIX: Import NameType and ValueType from the recommended internal path
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";


interface Hours3Weather {
  id: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  temperaturde: number;
  humidity: number;
  slp: number;
  stationPressure: number;
  dewPoint: number;
  vaporPressure: number;
  rain: number;
  rain24h: number;
  windspeed10m: number;
  winddirdedtion10m: number;
  visibility: number;
  date: Date;
}

type ViewMode = "day" | "week" | "month";
type WeatherVariable = "temperaturde" | "humidity" | "rain" | "windspeed10m" | "slp";

interface VariableDetail {
  label: string;
  icon: React.ReactNode;
  color: string;
  unit: string;
}

interface WeatherChartProps {
  filteredData: Hours3Weather[];
  viewMode: ViewMode;
  selectedVariable: WeatherVariable;
  getVariableDetails: (variable: WeatherVariable) => VariableDetail;
}

const formatXAxis = (data: Hours3Weather, viewMode: ViewMode): string => {
  const time = data.hours.toString().padStart(2, "0");

  if (viewMode === "day") {
    return `${time}:00`;
  }

  return `${data.day}/${data.month} ${time}:00`;
};

const CustomTooltip = ({
  active,
  payload,
  viewMode,
}: TooltipProps<ValueType, NameType> & { viewMode: ViewMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as Hours3Weather | undefined;

    if (!data) return null;

    const formatValue = (value: number | undefined, unit: string) =>
      value !== undefined ? `${value.toFixed(1)} ${unit}` : "N/A";

    return (
      <div className="p-3 bg-white border border-gray-300 shadow-xl rounded-lg text-sm transition duration-150 ease-in-out">
        <p className="font-extrabold text-indigo-700 mb-2 border-b pb-1">
          {formatXAxis(data, viewMode)}
        </p>
        <p className="text-red-600">
          อุณหภูมิ:{" "}
          <span className="font-semibold">
            {formatValue(data.temperaturde, "°C")}
          </span>
        </p>
        <p className="text-blue-600">
          ความชื้น:{" "}
          <span className="font-semibold">{formatValue(data.humidity, "%")}</span>
        </p>
        <p className="text-green-700">
          ฝน (ชั่วโมง):{" "}
          <span className="font-semibold">
            {formatValue(data.rain, "มม.")}
          </span>
        </p>
        <p className="text-purple-700">
          ความเร็วลม:{" "}
          <span className="font-semibold">
            {formatValue(data.windspeed10m, "m/s")}
          </span>
        </p>
        <p className="text-orange-700">
          ความกดอากาศ:{" "}
          <span className="font-semibold">
            {formatValue(data.slp, "hPa")}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

const WeatherChart: React.FC<WeatherChartProps> = ({
  filteredData,
  viewMode,
  selectedVariable,
  getVariableDetails,
}) => {
  const variableDetails = getVariableDetails(selectedVariable);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl py-12 px-6 shadow-inner m-4">
        <p className="text-xl font-medium text-gray-500">
          ไม่พบข้อมูลสภาพอากาศสำหรับช่วงเวลาที่เลือก
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.8} />

            <XAxis
              dataKey="id"
              tickFormatter={(value, index) =>
                formatXAxis(filteredData[index], viewMode)
              }
              height={60}
              angle={viewMode === "day" ? 0 : -30}
              interval={viewMode === "day" ? 0 : "preserveStartEnd"}
              textAnchor={viewMode === "day" ? "middle" : "end"}
              stroke="#555"
              style={{ fontSize: viewMode === "day" ? "12px" : "11px" }}
            />

            <YAxis
              yAxisId="main"
              orientation="left"
              stroke={variableDetails.color}
              domain={["auto", "auto"]}
              label={{
                value: `${variableDetails.label} (${variableDetails.unit})`,
                angle: -90,
                position: "insideLeft",
                fill: variableDetails.color,
                style: { textTransform: "uppercase", fontWeight: "bold" },
              }}
              tickFormatter={(value: number) => `${value.toFixed(1)}`}
            />

            <Tooltip content={<CustomTooltip viewMode={viewMode} />} />

            <Legend
              wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }}
              align="right"
              verticalAlign="top"
            />

            <Line
              yAxisId="main"
              type="monotone"
              dataKey={selectedVariable}
              stroke={variableDetails.color}
              name={variableDetails.label}
              dot={false}
              strokeWidth={3}
              activeDot={{
                r: 5,
                fill: variableDetails.color,
                stroke: variableDetails.color,
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherChart;