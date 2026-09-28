import { choice, TypeSafeClient } from "@typesafe-ai/sdk";
import {
  CHARACTER_IDS,
  CHARACTERS,
  EMPTY_PROBABILITIES,
  type CharacterId,
  type Probabilities,
} from "@/lib/characters";

const MAX_LENGTH = 200;

const criteria = Object.fromEntries(
  CHARACTER_IDS.map((id) => [
    id,
    `${CHARACTERS[id].name}: ${CHARACTERS[id].description}`,
  ]),
) as Record<CharacterId, string>;

const characterQuestion = choice(
  "Which Mean Girls (2004 movie) character is most likely to have said or typed this? Judge by catchphrases, voice, attitude and personality.",
  criteria,
);

let client: TypeSafeClient | null = null;
function getClient() {
  client ??= new TypeSafeClient({ timeout: 8000 });
  return client;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    text?: unknown;
  } | null;
  const text =
    typeof body?.text === "string" ? body.text.trim().slice(0, MAX_LENGTH) : "";

  if (!text) {
    return Response.json({
      choice: null,
      confidence: 0,
      probabilities: EMPTY_PROBABILITIES,
    });
  }

  if (!process.env.TYPESAFE_API_KEY) {
    return Response.json(
      { error: "TYPESAFE_API_KEY is not set" },
      { status: 503 },
    );
  }

  try {
    const { answers } = await getClient().systemOne({
      state: { message: text },
      questions: { character: characterQuestion },
    });
    const answer = answers.character;
    const probabilities = { ...EMPTY_PROBABILITIES };
    for (const id of CHARACTER_IDS) {
      probabilities[id] = Number(answer.probabilities[id] ?? 0);
    }
    return Response.json({
      choice: answer.choice,
      confidence: answer.confidence,
      probabilities: probabilities satisfies Probabilities,
    });
  } catch (error) {
    console.error("[classify] Jev request failed", error);
    return Response.json({ error: "Classification failed" }, { status: 502 });
  }
}
