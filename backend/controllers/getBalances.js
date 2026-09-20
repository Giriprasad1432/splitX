import Member from "../models/members.js";
import Expense from "../models/expenses.js";

const getBalances = async (req, res) => {
    try {
        const roomId = req.room._id;

        // Fetch all members of the room
        const members = await Member.find({ roomId });
        
        // Fetch all expenses of the room
        const expenses = await Expense.find({ roomId });

        // Initialize balances
        const balances = {};
        members.forEach(member => {
            balances[member._id.toString()] = {
                memberId: member._id,
                name: member.name,
                balance: 0
            };
        });

        // Calculate balances
        expenses.forEach(expense => {
            // Ignore expenses with no splits
            if (!expense.splits || expense.splits.length === 0) {
                return;
            }

            const paidByStr = expense.paidBy.toString();
            
            // Credit the payer with the full amount
            if (balances[paidByStr]) {
                balances[paidByStr].balance += expense.amount;
            }

            // Debit the participants
            expense.splits.forEach(split => {
                const memberIdStr = split.memberId.toString();
                if (balances[memberIdStr]) {
                    balances[memberIdStr].balance -= split.amount;
                }
            });
        });

        // Convert balances object to an array
        const balancesArray = Object.values(balances);

        return res.status(200).json({
            message: "Balances calculated successfully",
            balances: balancesArray,
            room: {
                createdBy: req.room.createdBy
            }
        });

    } catch (error) {
        console.error("Error in getBalances:", error);
        return res.status(500).json({
            message: "Failed to calculate balances"
        });
    }
};

export { getBalances };
