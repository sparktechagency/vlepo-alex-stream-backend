import { Document, model, ObjectId, Schema } from "mongoose";
import { z } from "zod";

interface IAttendance extends Document {
    eventId: ObjectId;
    userId: ObjectId;
}

const attendanceSchema = new Schema<IAttendance>({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const AttendanceModel = model<IAttendance>("Attendance", attendanceSchema);

// Zod Validation
export const attendanceSchemaValidation = z.object({
    body: z.object({
        eventId: z
            .string()
            .refine((id) => /^[a-f\d]{24}$/i.test(id), { message: "Invalid eventId format" }),
    }),
});