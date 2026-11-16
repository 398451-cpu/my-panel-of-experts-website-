import { getAuth } from "@clerk/express";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  CreateExpertBody,
  CreateExpertResponse,
  DeleteExpertParams,
  GetExpertParams,
  GetExpertResponse,
  GetExpertsResponse,
  UpdateExpertBody,
  UpdateExpertParams,
  UpdateExpertResponse,
} from "@workspace/api-zod";
import { db, expertsTable } from "@workspace/db";

const router: IRouter = Router();

function userIdOrRespond(req: Request, res: Response): string | null {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to manage your panel." });
    return null;
  }
  return userId;
}

router.get("/experts", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;

  const experts = await db
    .select()
    .from(expertsTable)
    .where(and(eq(expertsTable.ownerId, ownerId), isNull(expertsTable.archivedAt)))
    .orderBy(desc(expertsTable.createdAt));

  res.json(GetExpertsResponse.parse(experts));
});

router.post("/experts", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;

  const parsed = CreateExpertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expert] = await db
    .insert(expertsTable)
    .values({ ...parsed.data, ownerId, avatarUrl: parsed.data.avatarUrl ?? null })
    .returning();

  res.status(201).json(CreateExpertResponse.parse(expert));
});

router.get("/experts/:id", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = GetExpertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expert] = await db
    .select()
    .from(expertsTable)
    .where(and(
      eq(expertsTable.id, params.data.id),
      eq(expertsTable.ownerId, ownerId),
      isNull(expertsTable.archivedAt),
    ))
    .limit(1);

  if (!expert) {
    res.status(404).json({ error: "Expert not found." });
    return;
  }
  res.json(GetExpertResponse.parse(expert));
});

router.patch("/experts/:id", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = UpdateExpertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateExpertBody.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    res.status(400).json({ error: parsed.success ? "Provide at least one field to update." : parsed.error.message });
    return;
  }

  const [expert] = await db
    .update(expertsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(
      eq(expertsTable.id, params.data.id),
      eq(expertsTable.ownerId, ownerId),
      isNull(expertsTable.archivedAt),
    ))
    .returning();

  if (!expert) {
    res.status(404).json({ error: "Expert not found." });
    return;
  }
  res.json(UpdateExpertResponse.parse(expert));
});

router.delete("/experts/:id", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = DeleteExpertParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expert] = await db
    .update(expertsTable)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(
      eq(expertsTable.id, params.data.id),
      eq(expertsTable.ownerId, ownerId),
      isNull(expertsTable.archivedAt),
    ))
    .returning({ id: expertsTable.id });

  if (!expert) {
    res.status(404).json({ error: "Expert not found." });
    return;
  }
  res.sendStatus(204);
});

export default router;
