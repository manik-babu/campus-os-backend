import { Router } from 'express';
import { authRouter } from '../module/auth/auth.routes';
import { superAdminRouter } from '../module/superAdmin/superAdmin.routes';
import { adminRouter } from '../module/admin/admin.routes';
import { auth } from '../middleware/auth';
import { UserRole } from '../../generated/prisma/client';
import { publicRouter } from '../module/public/public.routes';
import { paymentRouter } from '../module/payment/payment.routes';
import { commonRouter } from '../module/common/common.routes';
import { studentRouter } from '../module/student/student.routes';
import { facultyRouter } from '../module/faculty/faculty.routes';

//? This file will be the main router that combines all the module-specific routers (auth, user, course, etc.)
//? /api/v1/ -> apiRouter
const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/super-admin", auth(UserRole.SUPER_ADMIN), superAdminRouter);
apiRouter.use("/admin", auth(UserRole.ADMIN), adminRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/payment", paymentRouter);
apiRouter.use("/common", commonRouter);
apiRouter.use("/students", auth(UserRole.STUDENT), studentRouter);
apiRouter.use("/faculty", auth(UserRole.FACULTY), facultyRouter);
export default apiRouter;