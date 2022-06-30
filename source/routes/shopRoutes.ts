import * as shopController from "../controllers/shopController";
import * as jwtAuth from "../middleware/jwtAuth";
import express from "express";
import cors from "cors";

const router = express.Router();
router.use(cors());

router.get("/stores", shopController.getStores);

router.get("stores/:storeId/items", shopController.getSingleStore);

router.get("/stores/items/:itemId", shopController.getItem);

router.get("stores/search", shopController.search);

export default router;
