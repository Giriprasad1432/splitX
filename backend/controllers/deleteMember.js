import Member from "../models/members.js";
import Expense from "../models/expenses.js";

const deleteMember = async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({
                message: "Member ID is required"
            });
        }

        const member = await Member.findById(memberId);
        
        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        if (member.roomId.toString() !== req.room._id.toString()) {
            return res.status(403).json({
                message: "Member does not belong to this room"
            });
        }

        // Check if the current user is the admin (creator of the room)
        const currentUserId = req.headers.memberid;
        if (req.room.createdBy && req.room.createdBy.toString() !== currentUserId) {
            return res.status(403).json({
                message: "Only the admin can remove members"
            });
        }

        // Check if member is involved in any expenses
        const expenses = await Expense.find({ roomId: req.room._id });
        let isInvolved = false;
        
        for (let expense of expenses) {
            if (expense.paidBy.toString() === memberId) {
                isInvolved = true;
                break;
            }
            if (expense.splits && expense.splits.some(split => split.memberId.toString() === memberId)) {
                isInvolved = true;
                break;
            }
        }

        if (isInvolved) {
            return res.status(400).json({
                message: "Cannot remove member involved in expenses. Settle or delete expenses first."
            });
        }

        await Member.findByIdAndDelete(memberId);

        return res.status(200).json({
            message: "Member removed successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to remove member"
        });
    }
}

export { deleteMember };
