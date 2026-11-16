import { getAuth } from "@clerk/express";
import { Router, type IRouter } from "express";
import {
  SearchPanelQueryParams,
  SearchPanelResponse,
} from "@workspace/api-zod";
import { searchOwnedPanel } from "./questions";

const router: IRouter = Router();

router.get("/search", async (req, res): Promise<void> => {
  const ownerId = getAuth(req).userId;
  if (!ownerId) {
    res.status(401).json({ error: "Sign in to search your panel." });
    return;
  }

  const parsed = SearchPanelQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const query = parsed.data.q.trim();
  if (!query) {
    res.status(400).json({ error: "Enter a search term." });
    return;
  }

  const results = await searchOwnedPanel(ownerId, query);
  res.json(SearchPanelResponse.parse(results));
});

export default router;
