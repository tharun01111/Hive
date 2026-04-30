-- Indexes for common ownership, listing, pagination, and notification lookups.
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");

CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");
CREATE INDEX "projects_createdAt_idx" ON "projects"("createdAt");

CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

CREATE INDEX "columns_projectId_order_idx" ON "columns"("projectId", "order");

CREATE INDEX "cards_columnId_order_idx" ON "cards"("columnId", "order");
CREATE INDEX "cards_dueDate_idx" ON "cards"("dueDate");

CREATE INDEX "card_assignees_userId_idx" ON "card_assignees"("userId");

CREATE INDEX "activities_workspaceId_createdAt_idx" ON "activities"("workspaceId", "createdAt");
CREATE INDEX "activities_projectId_createdAt_idx" ON "activities"("projectId", "createdAt");
CREATE INDEX "activities_userId_createdAt_idx" ON "activities"("userId", "createdAt");

CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

CREATE INDEX "messages_projectId_createdAt_idx" ON "messages"("projectId", "createdAt");
CREATE INDEX "messages_userId_createdAt_idx" ON "messages"("userId", "createdAt");
