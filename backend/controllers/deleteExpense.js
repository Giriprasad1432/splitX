import Expense from "../models/expenses.js";

const deleteExpense = async (req, res) => {
    try {
        const { expenseId } = req.params;

        if (!expenseId) {
            return res.status(400).json({
                message: "Expense ID is required"
            });
        }

        const expense = await Expense.findById(expenseId);
        
        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        if (expense.roomId.toString() !== req.room._id.toString()) {
            return res.status(403).json({
                message: "Expense does not belong to this room"
            });
        }

        await Expense.findByIdAndDelete(expenseId);

        return res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to delete expense"
        });
    }
}

export { deleteExpense };
