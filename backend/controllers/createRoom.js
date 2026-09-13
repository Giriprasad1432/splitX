import crypto from "crypto";
import Room from "../models/room.js";

const generateRoomCode = () => {
    return crypto
        .randomBytes(4)
        .toString("base64url")
        .slice(0, 6)
        .toUpperCase();
};

export const createRoom = async (req, res) => {
    try {
        let roomCode;
        let existingRoom;

        do {
            roomCode = generateRoomCode();
            existingRoom = await Room.findOne({ roomCode });
        } while (existingRoom);

        const newRoom = await Room.create({
            roomCode,
            createdBy: req.body.createdBy,
            name: req.body.name,
            status: true
        });

        return res.status(201).json({
            message: "Room created successfully",
            room: newRoom
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to create room"
        });
    }
};