// import React from 'react';
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps,
// } from 'recharts';
// import { NameType, ValueType } from 'recharts/types/component/Tooltip';

// // --- Interface Definitions (ต้องตรงกับ Page.tsx) ---
// interface hours3weather {
//   id: number;
//   year: number;
//   month: number;
//   day: number;
//   hours: number;
//   temperaturde: number;
//   humidity: number;
//   slp: number;
//   stationPressure: number;
//   dewPoint: number;
//   vaporPressure: number;
//   rain: number;
//   rain24h: number;
//   windspeed10m: number;
//   winddirdedtion10m: number;
//   visibility: number;
//   date: Date;
// }

// type ViewMode = "day" | "week" | "month";
// type WeatherVariable = 'temperaturde' | 'humidity' | 'rain' | 'windspeed10m' | 'slp';

// interface VariableDetail {
//     label: string;
//     icon: any;
//     color: string;
//     unit: string;
//     // New property for Y-Axis orientation
//     axisId: 'main' | 'secondary';
// }

// interface WeatherChartProps {
//   filteredData: hours3weather[];
//   viewMode: ViewMode;
//   // Change to array to support multiple lines
//   selectedVariables: WeatherVariable[];
//   getVariableDetails: (variable: WeatherVariable) => VariableDetail;
// }

// // --- Helper Functions ---
// const formatXAxis = (data: hours3weather, viewMode: ViewMode): string => {
//   const time = data.hours.toString().padStart(2, '0');

//   if (viewMode === 'day') {
//     return `${time}:00`;
//   }

//   // Use Thai locale for better date formatting if possible, otherwise use standard
//   return `${data.day}/${data.month} ${time}:00`;
// };

// const formatValue = (value: number | undefined, unit: string) =>
//   value !== undefined ? `${value.toFixed(1)} ${unit}` : 'N/A';

// // --- Custom Tooltip Component ---
// interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
//     viewMode: ViewMode;
//     getVariableDetails: (variable: WeatherVariable) => VariableDetail;
// }

// const CustomTooltip = ({ active, payload, viewMode, getVariableDetails }: CustomTooltipProps) => {
//   if (active && payload && payload.length) {
//     // The payload data is the same for all lines at that point
//     const data: hours3weather = payload[0].payload;

//     if (!data) return null;

//     return (
//       <div className="p-3 bg-white border border-gray-300 shadow-xl rounded-lg text-sm transition duration-150 ease-in-out">
//         <p className="font-extrabold text-indigo-700 mb-2 border-b pb-1">
//           {formatXAxis(data, viewMode)}
//         </p>
//         {/* Iterate over all visible data points in the payload */}
//         {payload.map((item, index) => {
//             const dataKey = item.dataKey as WeatherVariable;
//             const detail = getVariableDetails(dataKey);
//             const value = data[dataKey]; // Access the value directly from the data object

//             return (
//                 <p key={`tooltip-item-${index}`} style={{ color: detail.color }}>
//                     {detail.label}: <span className="font-semibold">{formatValue(value, detail.unit)}</span>
//                 </p>
//             );
//         })}
//       </div>
//     );
//   }

//   return null;
// };


// // --- Main Chart Component ---
// const WeatherChart: React.FC<WeatherChartProps> = ({ filteredData, viewMode, selectedVariables, getVariableDetails }) => {

//   // If no variables are selected, default to Temperature and Humidity
//   const variablesToShow = selectedVariables.length > 0 ? selectedVariables : ['temperaturde', 'humidity'];

//   if (filteredData.length === 0) {
//     return (
//       <div className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-xl py-12 px-6 shadow-inner m-4">
//         <p className="text-xl font-medium text-gray-500">
//           ไม่พบข้อมูลสภาพอากาศสำหรับช่วงเวลาที่เลือก
//         </p>
//       </div>
//     );
//   }

//   // Get details for all selected variables
//   const detailsMap = new Map<WeatherVariable, VariableDetail>();
//   variablesToShow.forEach(v => detailsMap.set(v, getVariableDetails(v)));

//   // Determine which variables use the 'main' (left) axis and which use the 'secondary' (right) axis
//   const mainAxisVariables = variablesToShow.filter(v => detailsMap.get(v)?.axisId === 'main');
//   const secondaryAxisVariables = variablesToShow.filter(v => detailsMap.get(v)?.axisId === 'secondary');

//   // Helper to get combined label/unit for Y-Axis
//   const getAxisLabel = (variables: WeatherVariable[]) => {
//       const labels = variables.map(v => detailsMap.get(v)?.label);
//       const units = [...new Set(variables.map(v => detailsMap.get(v)?.unit))]; // Unique units only
//       return `${labels.join(', ')} (${units.join('/')})`;
//   };

//   // Get the color for the Y-Axis label. Use the color of the first variable on that axis.
//   const mainAxisColor = mainAxisVariables.length > 0 ? detailsMap.get(mainAxisVariables[0])?.color : '#333';
//   const secondaryAxisColor = secondaryAxisVariables.length > 0 ? detailsMap.get(secondaryAxisVariables[0])?.color : '#333';


//   return (
//     <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
//       <div style={{ width: '100%', height: 400 }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={filteredData}
//             margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeOpacity={0.8} />

//             {/* X-Axis: Time/Date */}
//             <XAxis
//               dataKey="id"
//               tickFormatter={(value, index) => filteredData[index] ? formatXAxis(filteredData[index], viewMode) : ''}
//               height={60}
//               angle={viewMode === 'day' ? 0 : -30}
//               interval={viewMode === 'day' ? 0 : 'preserveStartEnd'}
//               textAnchor={viewMode === 'day' ? 'middle' : 'end'}
//               stroke="#555"
//               style={{ fontSize: viewMode === 'day' ? '12px' : '11px' }}
//             />

//             {/* Y-Axis: Main (Left) */}
//             {mainAxisVariables.length > 0 && (
//                 <YAxis
//                     yAxisId="main"
//                     orientation="left"
//                     stroke={mainAxisColor}
//                     domain={['auto', 'auto']}
//                     label={{
//                         value: getAxisLabel(mainAxisVariables),
//                         angle: -90,
//                         position: 'insideLeft',
//                         fill: mainAxisColor,
//                         style: { textTransform: 'uppercase', fontWeight: 'bold' }
//                     }}
//                     tickFormatter={(value: number) => `${value.toFixed(1)}`}
//                 />
//             )}

//             {/* Y-Axis: Secondary (Right) - Only if there are variables assigned to it */}
//             {secondaryAxisVariables.length > 0 && (
//                 <YAxis
//                     yAxisId="secondary"
//                     orientation="right"
//                     stroke={secondaryAxisColor}
//                     domain={['auto', 'auto']}
//                     label={{
//                         value: getAxisLabel(secondaryAxisVariables),
//                         angle: 90,
//                         position: 'insideRight',
//                         fill: secondaryAxisColor,
//                         style: { textTransform: 'uppercase', fontWeight: 'bold' }
//                     }}
//                     tickFormatter={(value: number) => `${value.toFixed(1)}`}
//                 />
//             )}

//             <Tooltip content={<CustomTooltip viewMode={viewMode} getVariableDetails={getVariableDetails} />} />

//             <Legend
//               wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
//               align="right"
//               verticalAlign="top"
//             />

//             {/* Plot all selected variables as lines */}
//             {variablesToShow.map((variable, index) => {
//                 const detail = detailsMap.get(variable)!;
//                 return (
//                     <Line
//                         key={variable}
//                         yAxisId={detail.axisId}
//                         type="monotone"
//                         dataKey={variable as string}
//                         stroke={detail.color}
//                         name={detail.label}
//                         dot={false}
//                         strokeWidth={3}
//                         activeDot={{ r: 5, fill: detail.color, stroke: detail.color, strokeWidth: 2 }}
//                     />
//                 );
//             })}

//           </LineChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default WeatherChart;


export default function Box () {
  return(
    <div>
      Hell word
    </div>
  )
}