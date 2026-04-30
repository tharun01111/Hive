import "dotenv/config";
import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import workspaceProjectRoutes from "./routes/workspace-project.routes.js";
import kanbanRoutes from "./routes/kanban.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import { initSocket } from "./sockets/index.js";

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", workspaceProjectRoutes);
app.use("/api/projects/:projectId", kanbanRoutes);
app.use("/api/projects/:projectId/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", activityRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "hive-server" });
});

await initSocket(httpServer);

// Global error handler — catches anything that slips past controllerHandler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({
    error: err.message ?? "Internal server error",
  });
});

httpServer.listen(PORT, () => {
  console.log(`Hive server running on port ${PORT}`);
});
