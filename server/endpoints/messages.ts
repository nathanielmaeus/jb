import { Router } from "express";
import { getMessages } from "../services/messages";

const router = Router();

router.get("/api/messages", async (req, res) => {
  const { lastMessageId, size } = req.query;

  if (typeof lastMessageId === "undefined" || typeof size === "undefined") {
    res.status(400).send("mandatory parameters are missing");
    return;
  }

  const id = lastMessageId === "" ? null : Number(lastMessageId);
  const currentSize = size === "" ? 100 : Number(size);

  const data = await getMessages({ lastMessageId: id, size: currentSize });
  res.status(200).json(data);
});

export default router;
