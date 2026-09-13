import Expense from "../models/expenses.js";
import {
    validateMembersInRoom,
    buildSplits
} from "../utils/calculateSplits.js";

const POPULATE_CONFIG = [
    { path: "paidBy", select: "name" },
    { path: "createdBy", select: "name" },
    { path: "participants", select: "name" },
    { path: "splits.memberId", select: "name" }
];

const splitExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;
        const roomId = req.room._id;
        const { participants, splitType, splits } = req.body;

        // Find expense
        const expense = await Expense.findById(expenseId);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        // Make sure expense belongs to this room
        if (expense.roomId.toString() !== roomId.toString()) {
            return res.status(403).json({
                message: "Expense does not belong to this room"
            });
        }

        // Validate splitType
        if (!splitType || !["equal", "unequal"].includes(splitType)) {
            return res.status(400).json({
                message: "splitType must be 'equal' or 'unequal'"
            });
        }

        // Validate participants
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({
                message: "participants must be a non-empty array"
            });
        }

        let validIds;

        try {
            validIds = await validateMembersInRoom(
                participants,
                roomId
            );
        } catch (err) {
            return res.status(err.status || 400).json({
                message: err.message
            });
        }

        // Build new splits
        let computedSplits;

        try {
            computedSplits = buildSplits(
                splitType,
                participants,
                expense.amount,
                splits,
                validIds
            );
        } catch (err) {
            return res.status(err.status || 400).json({
                message: err.message
            });
        }

        // Update current split
        expense.participants = participants;
        expense.splitType = splitType;
        expense.splits = computedSplits;

        await expense.save();

        const populated =
            await expense.populate(POPULATE_CONFIG);

        return res.status(200).json({
            message: "Expense split updated successfully",
            expense: populated
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to split expense"
        });
    }
};

export { splitExpense };