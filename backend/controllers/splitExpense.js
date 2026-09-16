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

        // Validate splitType only if there are participants
        if (participants && participants.length > 0) {
            if (!splitType || !["equal", "unequal"].includes(splitType)) {
                return res.status(400).json({
                    message: "splitType must be 'equal' or 'unequal'"
                });
            }
        }

        // Validate participants (allow empty array for un-splitting)
        if (!Array.isArray(participants)) {
            return res.status(400).json({
                message: "participants must be an array"
            });
        }

        let computedSplits = [];
        let validIds;

        // Only build splits if there are participants
        if (participants.length > 0) {
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

            try {
                computedSplits = buildSplits(
                    splitType,
                    participants,
                    req.body.amount || expense.amount,
                    splits,
                    validIds
                );
            } catch (err) {
                return res.status(err.status || 400).json({
                    message: err.message
                });
            }
        }

        // Update current split & core details if provided
        if (req.body.title) expense.title = req.body.title;
        if (req.body.amount) expense.amount = req.body.amount;
        if (req.body.paidBy) expense.paidBy = req.body.paidBy;

        expense.participants = participants;
        expense.splitType = participants.length > 0 ? splitType : null;
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