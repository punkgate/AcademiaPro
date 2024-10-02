'use client'

import React, { useEffect, useState } from "react";
import { AttendanceCourse } from "@/types/Attendance";
import { calculateMargin } from "@/utils/Margin";
import dynamic from "next/dynamic";
import AttendancePill from "./AttendancePill";
import Margin from "./Margin";
import Title from "./Title";
import { useData } from "@/provider/DataProvider";
import { usePlanner } from "@/provider/DataCalProvider";
import PredictionContent from "./PredictionContent";

const Legend = dynamic(() => import("./Legend").then((a) => a.default), {
  ssr: true,
});

export default function AttendanceCard({
  course,
  legend,
}: {
  course: AttendanceCourse;
  legend?: boolean;
}) {
  const { timetable } = useData();
  const { dayOrder: day } = usePlanner();

  const { courseTitle, hoursConducted, hoursAbsent, attendancePercentage, category } = course;
  const present = parseInt(hoursConducted, 10) - parseInt(hoursAbsent, 10);
  const total = parseInt(hoursConducted, 10);
  const absent = parseInt(hoursAbsent, 10);

  const [margin, setMargin] = useState(0);
  const [predictedAttendance, setPredictedAttendance] = useState<number | null>(null);

  // Calculate margin based on current attendance
  useEffect(() => {
    setMargin(calculateMargin(present, total));
  }, [present, total]);

  // Handle attendance prediction based on future classes attended between selected dates
  const handleAttendancePrediction = (extraClasses: number) => {
    const newAttendance = (present + extraClasses) / (total + extraClasses) * 100;
    setPredictedAttendance(newAttendance);
  };

  return (
    <div tabIndex={0} role="gridcell" className="attendance-card">
      {/* Existing Attendance Display */}
      <Title courseTitle={courseTitle} category={category} />
      <Margin margin={margin} category={category} courseTitle={courseTitle} />
      <AttendancePill present={present} absent={absent} total={total} />
      <span className="attendance-percentage">{attendancePercentage.replace(".00", "")}%</span>

      {/* Add Date Input and Prediction */}
      <div>
        <h3>Predict Attendance for Specific Dates:</h3>
        <PredictionContent onPrediction={handleAttendancePrediction} />
        {predictedAttendance !== null && (
          <p>Predicted Attendance: {predictedAttendance.toFixed(2)}%</p>
        )}
      </div>
    </div>
  );
}
