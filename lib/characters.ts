export const CHARACTER_IDS = [
  "regina",
  "gretchen",
  "karen",
  "cady",
  "janis",
  "damian",
  "norbury",
  "mrs_george",
] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];

export type Probabilities = Record<CharacterId, number>;

type Character = {
  name: string;
  description: string;
  gifs: string[];
};

const giphy = (id: string) => `https://media.giphy.com/media/${id}/200w.gif`;

export const CHARACTERS: Record<CharacterId, Character> = {
  regina: {
    name: "Regina George",
    description:
      "The queen bee. Condescending, manipulative, vain and in control. Backhanded compliments, fake niceness, bossing people around, mocking others. Lines like 'Get in loser, we're going shopping', 'Boo, you whore', 'You can't sit with us', 'So you agree, you think you're really pretty?', 'Stop trying to make fetch happen'.",
    gifs: [
      "9uxjfkIHTOnpm",
      "UqqCo0sTw5PreERNp9",
      "l2YWonkOJQnNsXHs4",
      "MpmrNx3scJrPy",
    ].map(giphy),
  },
  gretchen: {
    name: "Gretchen Wieners",
    description:
      "Insecure, anxious follower desperate for approval, always trying to make slang happen, gossipy and bursting with secrets, rich-girl bragging. Lines like 'That is so fetch', 'My dad invented Toaster Strudel', 'My hair is so big because it's full of secrets', 'I can't help it that I'm popular', 'Irregardless'.",
    gifs: [
      "3otPoUjeyRisIDxPhK",
      "7wZDqH0oqlm92",
      "acllOmuvIrSne",
      "3o7aTHbH39h8xYePza",
    ].map(giphy),
  },
  karen: {
    name: "Karen Smith",
    description:
      "Sweet but hopelessly dim and literal, ditzy non-sequiturs, confident nonsense, weather or body 'predictions'. Lines like 'On Wednesdays we wear pink', 'I'm a mouse, duh', 'It's like I have ESPN or something', 'Why are you white?', 'Is butter a carb?', 'I can tell when it's raining'.",
    gifs: [
      "xT9KVtQBk8cGFcZH4A",
      "3o7aTJvqx8D4ruHv3y",
      "STr4AZd4i2HwMnCXwQ",
    ].map(giphy),
  },
  cady: {
    name: "Cady Heron",
    description:
      "The new girl, a math nerd raised in Africa, naive and earnest, compares school to the animal kingdom, awkward social confusion, sometimes word vomit. Lines like 'The limit does not exist', 'Grool', 'Jambo', 'I know it's supposed to be sweet', talking about math, calculus, mathletes or animals.",
    gifs: ["Jrk8r1Im507aEdvO9S", "qTO7lbGDn27i8", "3otPotFivKqtGpEspO"].map(
      giphy,
    ),
  },
  janis: {
    name: "Janis Ian",
    description:
      "Sarcastic, artsy, goth-leaning outsider who hates the Plastics and plots revenge. Dry cynical humor, blunt insults about popular girls, schemes and art. Lines like 'Regina George is a life ruiner', 'She's fabulous but she's evil', 'Let's take her down', 'You smell like a baby prostitute'.",
    gifs: ["CHzYffGVChQuQ", "rWVUK75d8TprG", "jQzgqshPVIQgw8JgHd"].map(giphy),
  },
  damian: {
    name: "Damian",
    description:
      "Flamboyant, dramatic, sassy, loyal best friend who loves gossip, drama and performing. Theatrical outbursts and cheering people on. Lines like 'She doesn't even go here!', 'Four for you Glen Coco, you go Glen Coco!', 'I'm too gay to function', 'Don't look at me!'.",
    gifs: [
      "3otPotf61Np8aXtAXu",
      "cmUGtk2pU3o4D1NIfI",
      "QXCzuhFF3wAlpD6ScL",
    ].map(giphy),
  },
  norbury: {
    name: "Ms. Norbury",
    description:
      "The dry, sardonic, exasperated math teacher. Adult reasoning, scolding kids for being mean, self-deprecating about her divorce, pushing students to be smart. Lines like 'I'm a pusher', 'You all have to stop calling each other sluts and whores', 'Calling somebody else fat won't make you any skinnier', 'I know you're not dumb'.",
    gifs: ["xT9KVqLKySiOxGNehO", "3o7aTvWSv5R0azWEUM", "l2YWyxHEXALNFhIM8"].map(
      giphy,
    ),
  },
  mrs_george: {
    name: "Mrs. George",
    description:
      "Regina's mom, desperately trying to be young and cool. Oversharing, hovering, offering snacks and drinks, misusing teen slang, enthusiastic parent energy. Lines like 'I'm not like a regular mom, I'm a cool mom', 'Can I get you girls anything?', 'I want you to know, if you ever need anything, just holler'.",
    gifs: [
      "JfpBjRpzE7nFV4XcRq",
      "zB4zSVXYFNEgMUrPhM",
      "3otPoDr7omW3Dkc492",
    ].map(giphy),
  },
};

export const EMPTY_PROBABILITIES: Probabilities = Object.fromEntries(
  CHARACTER_IDS.map((id) => [id, 0]),
) as Probabilities;
