import { getAuth } from "@clerk/express";
import { and, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  CreateQuestionAnswerBody,
  CreateQuestionAnswerResponse,
  CreateQuestionBody,
  CreateQuestionResponse,
  GetQuestionAnswersParams,
  GetQuestionAnswersResponse,
  GetQuestionParams,
  GetQuestionResponse,
  GetQuestionsQueryParams,
  GetQuestionsResponse,
} from "@workspace/api-zod";
import {
  answersTable,
  db,
  expertsTable,
  questionsTable,
  type AnswerRecord,
  type QuestionRecord,
} from "@workspace/db";

const router: IRouter = Router();

function userIdOrRespond(req: Request, res: Response): string | null {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Sign in to view your panel." });
    return null;
  }
  return userId;
}

async function getAnswers(ownerId: string, questionIds: number[]): Promise<AnswerRecord[]> {
  if (questionIds.length === 0) return [];
  return db
    .select()
    .from(answersTable)
    .where(and(
      eq(answersTable.ownerId, ownerId),
      inArray(answersTable.questionId, questionIds),
    ))
    .orderBy(answersTable.createdAt);
}

async function getThread(ownerId: string, question: QuestionRecord) {
  const answers = await getAnswers(ownerId, [question.id]);
  return { ...question, answers };
}

router.get("/questions", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const parsed = GetQuestionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { expertId, topic, status } = parsed.data;
  const filters = [eq(questionsTable.ownerId, ownerId)];
  if (expertId !== undefined) {
    filters.push(or(
      eq(questionsTable.expertId, expertId),
      isNull(questionsTable.expertId),
    )!);
  }
  if (topic) filters.push(eq(questionsTable.topic, topic));

  const questions = await db
    .select()
    .from(questionsTable)
    .where(and(...filters))
    .orderBy(desc(questionsTable.createdAt))
    .limit(100);
  const answers = await getAnswers(ownerId, questions.map((question) => question.id));
  const answersByQuestion = new Map<number, AnswerRecord[]>();
  for (const answer of answers) {
    const current = answersByQuestion.get(answer.questionId) ?? [];
    current.push(answer);
    answersByQuestion.set(answer.questionId, current);
  }
  const threads = questions
    .map((question) => ({
      ...question,
      answers: answersByQuestion.get(question.id) ?? [],
    }))
    .filter((question) => {
      if (status === "answered") return question.answers.length > 0;
      if (status === "open") return question.answers.length === 0;
      return true;
    });

  res.json(GetQuestionsResponse.parse(threads));
});

router.post("/questions", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const parsed = CreateQuestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let expertName: string | null = null;
  if (parsed.data.expertId !== null) {
    const [expert] = await db
      .select({ id: expertsTable.id, name: expertsTable.name })
      .from(expertsTable)
      .where(and(
        eq(expertsTable.id, parsed.data.expertId),
        eq(expertsTable.ownerId, ownerId),
        isNull(expertsTable.archivedAt),
      ))
      .limit(1);
    if (!expert) {
      res.status(404).json({ error: "Expert not found." });
      return;
    }
    expertName = expert.name;
  }

  const [question] = await db
    .insert(questionsTable)
    .values({ ...parsed.data, ownerId, expertName })
    .returning();
  const thread = { ...question, answers: [] };
  res.status(201).json(CreateQuestionResponse.parse(thread));
});

router.get("/questions/:id", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = GetQuestionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [question] = await db
    .select()
    .from(questionsTable)
    .where(and(
      eq(questionsTable.id, params.data.id),
      eq(questionsTable.ownerId, ownerId),
    ))
    .limit(1);
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }
  res.json(GetQuestionResponse.parse(await getThread(ownerId, question)));
});

router.get("/questions/:id/answers", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = GetQuestionAnswersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [question] = await db
    .select({ id: questionsTable.id })
    .from(questionsTable)
    .where(and(
      eq(questionsTable.id, params.data.id),
      eq(questionsTable.ownerId, ownerId),
    ))
    .limit(1);
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }

  const answers = await getAnswers(ownerId, [question.id]);
  res.json(GetQuestionAnswersResponse.parse(answers));
});

router.post("/questions/:id/answers", async (req, res): Promise<void> => {
  const ownerId = userIdOrRespond(req, res);
  if (!ownerId) return;
  const params = GetQuestionAnswersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateQuestionAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [question] = await db
    .select()
    .from(questionsTable)
    .where(and(
      eq(questionsTable.id, params.data.id),
      eq(questionsTable.ownerId, ownerId),
    ))
    .limit(1);
  if (!question) {
    res.status(404).json({ error: "Question not found." });
    return;
  }

  const [expert] = await db
    .select({ id: expertsTable.id, name: expertsTable.name })
    .from(expertsTable)
    .where(and(
      eq(expertsTable.id, parsed.data.expertId),
      eq(expertsTable.ownerId, ownerId),
      isNull(expertsTable.archivedAt),
    ))
    .limit(1);
  if (!expert) {
    res.status(404).json({ error: "Expert not found." });
    return;
  }

  if (question.expertId !== null && question.expertId !== expert.id) {
    res.status(400).json({ error: "This question is assigned to a different expert." });
    return;
  }

  const [answer] = await db
    .insert(answersTable)
    .values({
      ...parsed.data,
      ownerId,
      questionId: question.id,
      expertName: expert.name,
    })
    .returning();

  res.status(201).json(CreateQuestionAnswerResponse.parse(answer));
});

export async function searchOwnedPanel(ownerId: string, query: string) {
  const pattern = `%${query}%`;
  const [experts, questions, answers] = await Promise.all([
    db.select().from(expertsTable).where(and(
      eq(expertsTable.ownerId, ownerId),
      isNull(expertsTable.archivedAt),
      or(
        ilike(expertsTable.name, pattern),
        ilike(expertsTable.specialty, pattern),
        ilike(expertsTable.bio, pattern),
      ),
    )).orderBy(desc(expertsTable.createdAt)).limit(8),
    db.select().from(questionsTable).where(and(
      eq(questionsTable.ownerId, ownerId),
      or(
        ilike(questionsTable.body, pattern),
        ilike(questionsTable.topic, pattern),
      ),
    )).orderBy(desc(questionsTable.createdAt)).limit(8),
    db.select().from(answersTable).where(and(
      eq(answersTable.ownerId, ownerId),
      ilike(answersTable.body, pattern),
    )).orderBy(desc(answersTable.createdAt)).limit(8),
  ]);
  return { experts, questions, answers };
}

export default router;
