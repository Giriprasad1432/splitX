import Expense from "../models/expenses.js";

const POPULATE_CONFIG = [
    { path: "paidBy", select: "name" },
    { path: "createdBy", select: "name" },
    { path: "participants", select: "name" },
    { path: "splits.memberId", select: "name" }
];

const getExpenses = async (req, res) => {
    try {
        const filter = { roomId: req.room._id };

        const expenses = await Expense.find(filter)
            .populate(POPULATE_CONFIG)
            .sort({ createdAt: -1 });

        if (expenses.length === 0) {
            return res.status(200).json({
                message: "No expenses found",
                count: 0,
                expenses: []
            });
        }

        return res.status(200).json({
            message: "Expenses fetched successfully",
            count: expenses.length,
            expenses
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Failed to fetch expenses" });
    }
};

export { getExpenses };