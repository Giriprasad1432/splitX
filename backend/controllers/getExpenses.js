import Expense from "../models/expenses.js";

const POPULATE_CONFIG = [
    { path: "paidBy", select: "name" },
    { path: "createdBy", select: "name" },
    { path: "participants", select: "name" },
    { path: "splits.memberId", select: "name" }
];

const ALLOWED_STATUSES = ["pending", "settled"];

const getExpenses = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = { roomId: req.room._id };

        if (status !== undefined) {
            if (!ALLOWED_STATUSES.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status filter. Must be one of: ${ALLOWED_STATUSES.join(", ")}`
                });
            }
            filter.status = status;
        }

        const expenses = await Expense.find(filter)
            .populate(POPULATE_CONFIG)
            .sort({ createdAt: -1 });

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