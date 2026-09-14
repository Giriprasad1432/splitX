import Room from "../models/room.js";
import Member from "../models/members.js";

const addMember = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const { name } = req.body;
        
        // We know the room exists and is active because of authRoom middleware,
        // but we need it to get the _id. authRoom attaches req.room.
        const room = req.room;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        const existingMember = await Member.findOne({
            roomId: room._id,
            name: name.trim()
        });

        if (existingMember) {
            return res.status(400).json({
                message: "Member already exists"
            });
        }

        const newMember = await Member.create({
            roomId: room._id,
            name: name.trim()
        });

        return res.status(201).json({
            message: "Member added successfully",
            member: newMember
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to add member"
        });
    }
};

export { addMember };
