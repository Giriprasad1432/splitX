import Room from "../models/room.js";
import Member from "../models/members.js";

const joinRoom = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const { name } = req.body;
        const room = await Room.findOne({ roomCode });

        const existingMember = await Member.findOne({
            roomId: room._id,
            name
        });

        if (existingMember) {
            return res.status(400).json({
                message: "Member already exists"
            });
        }

        const newMember = await Member.create({
            roomId: room._id,
            name
        });

        return res.status(201).json({
            message: "Joined room successfully",
            member: newMember
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to join room"
        });
    }
};

export { joinRoom };