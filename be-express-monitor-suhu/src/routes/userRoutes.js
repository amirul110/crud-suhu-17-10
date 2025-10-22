// di be-express-monitor-suhu/src/routes/userRoutes.js
import { Router } from "express";
import { 
  fetchAllUsers, 
  createNewUser, 
  updateUserById, 
  deleteUserById 
} from "../controllers/userController.js";

const router = Router();

router.get("/", fetchAllUsers);
router.post("/create", createNewUser);
router.put("/:id", updateUserById);       // ✅ ADD THIS
router.delete("/:id", deleteUserById);    // ✅ ADD THIS

export default router;