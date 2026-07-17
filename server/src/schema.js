export function validateStudyMaterial(value) {
  if (!value || typeof value !== 'object') throw new Error('The AI response was not an object.');
  const text = (item) => typeof item === 'string' && item.trim().length > 0;
  if (!text(value.title) || !text(value.summary)) throw new Error('The AI response is missing its title or summary.');
  if (!Array.isArray(value.keyPoints) || !value.keyPoints.length || !value.keyPoints.every(text)) throw new Error('The AI response has no usable key points.');
  if (!Array.isArray(value.flashcards) || !value.flashcards.length || !value.flashcards.every(c => text(c?.question) && text(c?.answer))) throw new Error('The AI response has no usable flashcards.');
  if (!Array.isArray(value.quiz) || !value.quiz.length || !value.quiz.every(q => text(q?.question) && Array.isArray(q?.options) && q.options.length === 4 && q.options.every(text) && text(q?.correctAnswer) && q.options.includes(q.correctAnswer))) throw new Error('The AI response has an invalid quiz.');
  return { title: value.title.trim(), summary: value.summary.trim(), keyPoints: value.keyPoints.map(x => x.trim()), flashcards: value.flashcards.map(c => ({ question: c.question.trim(), answer: c.answer.trim() })), quiz: value.quiz.map(q => ({ question: q.question.trim(), options: q.options.map(x => x.trim()), correctAnswer: q.correctAnswer.trim() })) };
}
