import { Router, type IRouter } from "express";
import healthRouter from "./health";
import expertsRouter from "./experts";
import questionsRouter from "./questions";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use(expertsRouter);
router.use(questionsRouter);
router.use(searchRouter);

export default router;
