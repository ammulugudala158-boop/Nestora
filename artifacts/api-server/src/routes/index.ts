import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import businessRouter from "./business";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import ordersRouter from "./orders";
import offersRouter from "./offers";
import loyaltyRouter from "./loyalty";
import reviewsRouter from "./reviews";
import ticketsRouter from "./tickets";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import customersRouter from "./customers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(businessRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(offersRouter);
router.use(loyaltyRouter);
router.use(reviewsRouter);
router.use(ticketsRouter);
router.use(notificationsRouter);
router.use(analyticsRouter);
router.use(customersRouter);

export default router;
