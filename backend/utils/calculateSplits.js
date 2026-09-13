import Member from "../models/members.js";

/**
 * Validates that all given IDs belong to the specified room.
 * Returns the set of valid member ID strings for fast lookup.
 * Throws an object { status, message } on failure.
 */
const validateMembersInRoom = async (memberIds, roomId) => {
    const members = await Member.find({
        _id: { $in: memberIds },
        roomId
    }).select("_id");

    const foundIds = new Set(members.map((m) => m._id.toString()));

    for (const id of memberIds) {
        if (!foundIds.has(id.toString())) {
            throw { status: 400, message: `Member ${id} does not belong to this room` };
        }
    }

    return foundIds;
};

/**
 * Builds the splits array and validates inputs.
 * Returns { splits } ready to save, or throws { status, message }.
 *
 * @param {string}   splitType    - "equal" | "unequal"
 * @param {string[]} participants - array of member ID strings
 * @param {number}   amount       - total expense amount
 * @param {Array}    splits       - manual splits (only used when splitType === "unequal")
 * @param {Set}      validIds     - Set of room-member ID strings (already validated)
 */
const buildSplits = (splitType, participants, amount, splits, validIds) => {
    if (splitType === "equal") {
        const share = parseFloat((amount / participants.length).toFixed(2));
        const computed = participants.map((memberId) => ({ memberId, amount: share }));
        return computed;
    }

    // --- unequal ---
    if (!splits || splits.length === 0) {
        throw { status: 400, message: "splits array is required for unequal split" };
    }

    const seenIds = new Set();

    for (const split of splits) {
        const idStr = split.memberId?.toString();

        // Must be in room
        if (!validIds.has(idStr)) {
            throw { status: 400, message: `Split member ${idStr} does not belong to this room` };
        }

        // Must be in participants
        if (!participants.map((p) => p.toString()).includes(idStr)) {
            throw { status: 400, message: `Split member ${idStr} is not in the participants list` };
        }

        // No duplicates
        if (seenIds.has(idStr)) {
            throw { status: 400, message: `Duplicate member ${idStr} in splits` };
        }
        seenIds.add(idStr);

        // Positive amounts
        if (!split.amount || split.amount <= 0) {
            throw { status: 400, message: `Split amount for member ${idStr} must be positive` };
        }
    }

    // Sum must equal total amount (allow ±0.01 for floating-point rounding)
    const total = splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(total - amount) > 0.01) {
        throw {
            status: 400,
            message: `Split amounts sum to ${total} but expense amount is ${amount}`
        };
    }

    return splits;
};

export { validateMembersInRoom, buildSplits };
