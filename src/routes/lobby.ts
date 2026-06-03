import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (request, response) => {

const {user} = request.session;
response.render("lobby", {user});

});

export default router;
