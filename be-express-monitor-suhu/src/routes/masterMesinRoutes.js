import { Router } from "express";
import {
  fetchAllMasterMesin,
  fetchMasterMesinById, 
  createMasterMesin,
  updateMasterMesin,
  destroyMasterMesin  // ✅ FUNCTION INI YANG MENGEMBALIKAN ERROR
} from "../controllers/masterMesinController.js";

const router = Router();

router.get("/", fetchAllMasterMesin);
router.get("/:id", fetchMasterMesinById);
router.post("/create", createMasterMesin);
router.put("/edit/:id", updateMasterMesin);
router.delete("/delete/:id", destroyMasterMesin); // 🚨 INI YANG TERPANGGIL?

export default router;