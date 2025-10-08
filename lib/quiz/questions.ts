export type QuizQuestion = {
  situation: string;
  responses: string[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    situation:
      "It's Saturday morning. You wake up with no plans. What sounds most appealing?",
    responses: [
      'Sleep in and enjoy a slow, cozy morning at home',
      'Head out for an adventure and explore somewhere new',
    ],
  },
  {
    situation:
      "You're ordering at a new café. The menu is huge. What do you do?",
    responses: [
      'Ask the barista for their recommendation',
      'Take your time reading every option carefully',
    ],
  },
  {
    situation:
      'Your friends invite you to a spontaneous road trip leaving in an hour. You:',
    responses: [
      'Pack quick and go – sounds like an adventure!',
      'Politely decline – you prefer to plan things out',
    ],
  },
  {
    situation: "It's a hot summer day. What's your ideal way to cool down?",
    responses: [
      'Something cold, light, and refreshing',
      'Something creamy, indulgent, and sweet',
    ],
  },
  {
    situation: "You're at a party. Where are you most likely to be found?",
    responses: [
      'In the center of the action, chatting with everyone',
      'Taking breaks in a quieter space to recharge',
    ],
  },
  {
    situation:
      "You're picking a drink for a study/work session. What matters most?",
    responses: [
      'A caffeine boost to keep me focused and alert',
      'Something comforting and soothing',
    ],
  },
  {
    situation:
      "Your friend says, 'Trust me, this is amazing – you have to try it!' You:",
    responses: [
      'Try it immediately – I love discovering new things',
      "Ask what's in it first, then decide",
    ],
  },
  {
    situation: "When choosing your vibe for the day, you're drawn to:",
    responses: ['Bold, bright, and full of energy', 'Soft, cozy, and calm'],
  },
  {
    situation: "It's 3 PM and you need a pick-me-up. What are you craving?",
    responses: [
      'Something fizzy and refreshing to wake me up',
      'A rich, creamy drink to treat myself',
    ],
  },
  {
    situation: 'When trying something new, you prefer:',
    responses: [
      "Jumping in – I'll figure it out as I go",
      'Understanding it thoroughly before trying',
    ],
  },
];
