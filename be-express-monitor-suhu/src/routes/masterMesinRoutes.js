import { Router } from "express";
import {
  createMasterMesin,
  destroyMasterMesin,
  fetchAllMasterMesin,
  fetchMasterMesinById,
  updateMasterMesin,
} from "../controllers/masterMesinController.js";

const router = Router();

router.get("/", fetchAllMasterMesin);
router.post("/create", createMasterMesin);
router.put("/edit/:id", updateMasterMesin);
router.delete("/delete/:id", destroyMasterMesin); // PASTIKAN INI ADA
router.get("/:id", fetchMasterMesinById);

export default router;