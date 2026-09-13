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

const addExpense = async (req, res) => {
    try {
        const {
            title,
            amount,
            paidBy,
            createdBy,
            participants,
            splitType,
            splits
        } = req.body;

        const roomId = req.room._id;

        // Validate creator and payer
        try {
            await validateMembersInRoom(
                [createdBy, paidBy],
                roomId
            );
        } catch (err) {
            return res.status(err.status || 400).json({
                message: err.message
            });
        }

        const hasParticipants =
            Array.isArray(participants) &&
            participants.length > 0;

        // -------------------------
        // EXPENSE WITHOUT SPLIT
        // -------------------------
        if (!hasParticipants) {
            const expense = await Expense.create({
                roomId,
                title,
                amount,
                paidBy,
                createdBy,
                participants: [],
                splits: [],
                splitType: null
            });

            const populated =
                await expense.populate(POPULATE_CONFIG);

            return res.status(201).json({
                message: "Expense saved without participants",
                expense: populated
            });
        }

        // -------------------------
        // EXPENSE WITH SPLIT
        // -------------------------
        if (!splitType || !["equal", "unequal"].includes(splitType)) {
            return res.status(400).json({
                message:
                    "splitType must be 'equal' or 'unequal' when participants are provided"
            });
        }

        // Validate participants
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

        // Calculate splits
        let computedSplits;

        try {
            computedSplits = buildSplits(
                splitType,
                participants,
                amount,
                splits,
                validIds
            );
        } catch (err) {
            return res.status(err.status || 400).json({
                message: err.message
            });
        }

        const expense = await Expense.create({
            roomId,
            title,
            amount,
            paidBy,
            createdBy,
            participants,
            splitType,
            splits: computedSplits
        });

        const populated =
            await expense.populate(POPULATE_CONFIG);

        return res.status(201).json({
            message: "Expense added and split successfully",
            expense: populated
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to add expense",
            error: error.message
        });
    }
};

export { addExpense };