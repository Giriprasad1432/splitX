import mongoose, { Schema } from "mongoose";

const expense = new Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },

        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },

        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Member"
            }
        ],

        splitType: {
            type: String,
            enum: ["equal", "unequal"],
            default: null
        },

        splits: [
            {
                memberId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Member"
                },
                amount: {
                    type: Number,
                    min: 0
                }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Expense", expense);