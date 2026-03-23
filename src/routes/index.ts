import { Router } from 'express';
import { authRouter } from '../module/auth/auth.routes';
import { superAdminRouter } from '../module/superAdmin/superAdmin.routes';
import { adminRouter } from '../module/admin/admin.routes';

//? This file will be the main router that combines all the module-specific routers (auth, user, course, etc.)
//? /api/v1/ -> apiRouter
const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/super-admin", superAdminRouter);
apiRouter.use("/admin", adminRouter);
export default apiRouter;