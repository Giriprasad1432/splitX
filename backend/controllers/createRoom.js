import crypto from "crypto";
import Room from "../models/room.js";
import Member from "../models/members.js";

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

        const newRoom = new Room({
            roomCode,
            name: req.body.name,
            status: true
        });

        const newMember = await Member.create({
            roomId: newRoom._id,
            name: req.body.createdBy
        });

        newRoom.createdBy = newMember._id;
        await newRoom.save();

        return res.status(201).json({
            message: "Room created successfully",
            room: newRoom,
            member: newMember
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Failed to create room"
        });
    }
};