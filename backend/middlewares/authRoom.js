import Room from "../models/room.js";

const authRoom = async (req, res, next) => {
    try {
        const { roomCode } = req.params;

        if (!roomCode) {
            return res.status(400).json({
                message: "Room code is required"
            });
        }

        const room = await Room.findOne({ roomCode });

        if (!room) {
            return res.status(404).json({
                message: "Invalid room code"
            });
        }

        if (!room.status) {
            return res.status(403).json({
                message: "Room is inactive"
            });
        }

        req.room = room;

        next();

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to validate room"
        });
    }
};

export { authRoom };