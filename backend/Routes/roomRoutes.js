import express from "express";
import { createRoom } from "../controllers/createRoom.js";
import { joinRoom } from "../controllers/joinRoom.js";
import { authRoom } from "../middlewares/authRoom.js";
import { addExpense } from "../controllers/addExpense.js";
import { addMember } from "../controllers/addMember.js";
import { getExpenses } from "../controllers/getExpenses.js";
import { splitExpense } from "../controllers/splitExpense.js";
import { getBalances } from "../controllers/getBalances.js";

const router = express.Router();

router.post("/create", createRoom);

router.post("/:roomCode/join", authRoom, joinRoom);

router.post("/:roomCode/members", authRoom, addMember);

router.post("/:roomCode/expenses", authRoom, addExpense);

router.get("/:roomCode/expenses", authRoom, getExpenses);

router.patch("/:roomCode/expenses/:expenseId/split", authRoom, splitExpense);

router.get("/:roomCode/balances", authRoom, getBalances);

export default router;