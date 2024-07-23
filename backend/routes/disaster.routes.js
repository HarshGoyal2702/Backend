// server/routes/disasters.js
import express from "express"
import { authentication, authorization } from "../middlewares/auth.js"
import { disasterAnalyse, newDisaster } from "../controllers/disaster.controllers.js";
const router = express.Router();

// Create disaster record manually
router.post('/', authentication, newDisaster);
// router.route('/:id').get().put(authentication, authorization,)
router.get('/search/:id', disasterAnalyse);
export default router;