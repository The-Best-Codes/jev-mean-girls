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
  lines: string[];
  gifs: string[];
};

const giphy = (id: string) => `https://media.giphy.com/media/${id}/200w.gif`;

export const CHARACTERS: Record<CharacterId, Character> = {
  regina: {
    name: "Regina George",
    lines: [
      "Get in, loser. We’re going shopping.",
      "But you’re, like, really pretty. So you agree? You think you’re really pretty?",
      "Gretchen, stop trying to make fetch happen! It’s not going to happen!",
      "Is butter a carb?",
      "Boo, you whore.",
      "I gave him everything. I was half a virgin when I met him.",
      "Why are you so obsessed with me?",
      "I like, invented her, you know what I mean?",
      "Whatever, I’m getting cheese fries.",
      "These sweatpants are all that fits me right now.",
      "You can walk home, bitches.",
      "That’s the ugliest f***ing skirt I’ve ever seen.",
      "This girl is the nastiest skank bitch I’ve ever met. DO NOT TRUST HER. She is a fugly slut!",
      "Okay, I’m going to forgive you because I’m a very Zen person… and I’m on a lot of pain medication right now.",
    ],
    gifs: [
      "mPvagRwDNZmAZ1di57",
      "l2YWEuleVCpfeBwqs",
      "3o7aTDMj1zvUElI4TK",
      "l2YWgOm7cak7P4Cly",
      "l0IukNXgBnxRXVjYA",
      "xT9KVgPvrda6FxPqnK",
      "MpmrNx3scJrPy",
      "65HLl3bvqrXIci1WSQ",
    ].map(giphy),
  },
  gretchen: {
    name: "Gretchen Wieners",
    lines: [
      "That is so fetch!",
      "Oh, it’s like slang from England.",
      "You can’t sit with us!",
      "I’m sorry that people are so jealous of me, but I can’t help it that I’m popular.",
      "Irregardless, ex-boyfriends are off-limits to friends. That’s just, like, the rules of feminism.",
      "I don’t think my father — the inventor of Toaster Strudel — would be too pleased to hear about this.",
      "Oh my God, Karen, you can’t just ask people why they’re white.",
      "We should totally just stab Caesar!",
      "Why should Caesar get to stomp around like a giant while the rest of us try not to get smushed under his big feet?",
      "You can only wear your hair in a ponytail once a week.",
      "Make sure you check out her mom’s boob job. They’re hard as rocks.",
    ],
    gifs: [
      "l2YWnkiUb8PQIe9u8",
      "xT9KVq9uWiLYECXrzi",
      "l2YWjUUkigI0Wcan6",
      "3o7aTDnTuzkXr4kmnm",
      "xT9KVwqY43ggnknkVW",
      "xT9KVJmP2apACttHji",
      "3o7aTHbH39h8xYePza",
      "xT9KVvi9l2Z6oNAYBG",
    ].map(giphy),
  },
  karen: {
    name: "Karen Smith",
    lines: [
      "On Wednesdays we wear pink.",
      "So if you’re from Africa, why are you white?",
      "I’m a mouse. Duh.",
      "I’m kind of psychic. I have a fifth sense.",
      "It’s like I have ESPN or something. My breasts can always tell when it’s going to rain. Well… they can tell when it’s raining.",
      "You wanna do something fun? You wanna go to Taco Bell?",
      "So that’s against the rules, and you can’t sit with us.",
      "I can’t go out. I’m sick.",
      "Gretchen, I’m sorry I laughed at you that time you got diarrhea at Barnes & Noble. And I’m sorry for telling everyone about it. And I’m sorry for repeating it now.",
      "I can stick my whole fist in my mouth.",
      "There’s a 30% chance that it’s already raining!",
    ],
    gifs: [
      "81j7b1mUJrxHq",
      "3o7aTl92FKQ41xRJoQ",
      "xT9KVrWHdXNBoakSGY",
      "3o7aTCcxm3mZWq5zoI",
      "xT9KVwyduvfvA077dS",
      "3o7aTJvqx8D4ruHv3y",
      "xT9KVdBpPIZoSaCO4g",
      "3otPonaTruk93BaXpC",
    ].map(giphy),
  },
  cady: {
    name: "Cady Heron",
    lines: [
      "On October 3rd, he asked me what day it was.",
      "It’s October 3rd.",
      "The limit does not exist!",
      "It’s not my fault you’re, like, in love with me or something!",
      "Grool. I meant to say great, but then I started to say cool.",
      "Calling somebody else fat won’t make you any skinnier. Calling someone stupid doesn’t make you any smarter. And ruining Regina George’s life definitely didn’t make me any happier.",
      "I have this theory that if you cut all her hair off, she’d look like a British man.",
      "I like math. And food.",
      "I have really bad breath in the morning.",
      "Having lunch with The Plastics was like leaving the actual world and entering Girl World.",
      "In Girl World, Halloween is the one night a year when a girl can dress like a total slut and no other girls can say anything about it.",
    ],
    gifs: [
      "3otPoLluU44ZsQlZQs",
      "l2YWBALRrWiZ2kP7y",
      "3otPotFivKqtGpEspO",
      "3otPou5rBmk0czKB4Q",
      "l2YWnKQk0MIiHnXGM",
      "xT9KVApBGJ1FRsG5qg",
      "xT9KVzhq9EXdpbwYrS",
      "nEltRxukhldok",
    ].map(giphy),
  },
  janis: {
    name: "Janis Ian",
    lines: [
      "You smell like a baby prostitute.",
      "See? That’s the thing with you Plastics. You think everybody is in love with you when actually everybody hates you.",
      "She’s a life ruiner. She ruins people’s lives.",
      "Evil takes a human form in Regina George.",
      "We gotta crack Gretchen Wieners. We crack Gretchen, and then we crack the lock on Regina’s whole dirty history.",
      "Your mom’s chest hair!",
      "Oh, I love seeing teachers outside of school. It’s like seeing a dog walk on its hind legs.",
      "There are two kinds of evil people in this world. Those who do evil stuff and those who see evil stuff being done and don’t try to stop it.",
      "You’re Plastic. Cold, shiny, hard Plastic!",
      "Beware of the Plastics.",
      "This is Damian: he’s almost too gay to function.",
    ],
    gifs: [
      "l2YWrHdkNTproTA9q",
      "l2YWxAhxFSoGLEdqg",
      "xT9KVszjrOi3losxrO",
      "xT9KVrV0hXiA6GCk00",
      "xT9KVLEvDNmPZGKzpm",
      "l2YWnMs4mEkwallIc",
      "3o7aTmMtLvnnOaAvoQ",
      "SUi8sIPpChcYYFWXjD",
    ].map(giphy),
  },
  damian: {
    name: "Damian",
    lines: [
      "That’s why her hair is so big. It’s full of secrets.",
      "She doesn’t even go here!",
      "Four for you, Glen Coco! You go, Glen Coco!",
      "And none for Gretchen Wieners. Bye.",
      "She asked me how to spell orange.",
      "Oh my God, Danny DeVito! I love your work!",
      "Say crack again.",
      "I WANT MY PINK SHIRT BACK!",
      "My grandma takes her wig off when she’s drunk.",
      "Ashton Kutcher!",
    ],
    gifs: [
      "TcjDO0Jb009ZS",
      "3otPowzvBZTj8Nx4M8",
      "26uTsgxxplCBOasmc",
      "l2YWtqm1NkjAFSIKc",
      "dTWKf8Iu6jIov0x8f6",
      "QXCzuhFF3wAlpD6ScL",
      "3otPotf61Np8aXtAXu",
      "xT9KVud4y415m9g1c4",
    ].map(giphy),
  },
  norbury: {
    name: "Ms. Norbury",
    lines: [
      "Raise your hand if you have ever been personally victimized by Regina George.",
      "I’m a pusher.",
      "Oh, hi. Did you wanna buy some drugs?",
      "You don’t need to dumb yourself down to be attractive to a guy.",
    ],
    gifs: [
      "3o7aTLkyh3yAG6DEuQ",
      "3o7aTvWSv5R0azWEUM",
      "xT9KVhjqs6uTcw5Nh6",
      "xT9KVzPCX9M708747S",
      "xT9KVibVJ7BIBsjSpi",
      "xT9KVf0UQCXGXocyQw",
      "3o7aTkegmUQz4Ezcty",
      "3otPoOfT591ytU7dSg",
    ].map(giphy),
  },
  mrs_george: {
    name: "Mrs. George",
    lines: [
      "I’m not like a regular mom. I’m a cool mom.",
      "Can I get you guys anything? Some snacks? A condom? Let me know! Oh, God love ya.",
    ],
    gifs: [
      "3o7aTDQJdzW1Snkk5G",
      "xT9KVoH6vI0vfqiSpG",
      "kKto00K3fqXQY",
      "3o7aTlgocDvCN1k2vC",
      "3otPoDr7omW3Dkc492",
      "l2YWA66BtQXD27d4c",
      "JfpBjRpzE7nFV4XcRq",
      "zB4zSVXYFNEgMUrPhM",
    ].map(giphy),
  },
};

export const EMPTY_PROBABILITIES: Probabilities = Object.fromEntries(
  CHARACTER_IDS.map((id) => [id, 0]),
) as Probabilities;
