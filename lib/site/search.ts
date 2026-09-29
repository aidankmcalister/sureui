export type SearchEntry = {
  href: string
  title: string
  page?: string
  text: string
}

function startsWord(text: string, word: string) {
  return ` ${text}`.replace(/[^a-z0-9]+/g, " ").includes(` ${word}`)
}

function score(entry: SearchEntry, words: string[]) {
  const title = entry.title.toLowerCase()
  const haystack = `${title} ${entry.page ?? ""} ${entry.text}`.toLowerCase()
  if (!words.every((word) => startsWord(haystack, word))) return 0
  if (entry.page && !words.some((word) => startsWord(title, word))) return 0
  const phrase = words.join(" ")
  let points = 1
  if (title === phrase) points += 8
  else if (title.startsWith(phrase)) points += 6
  else if (words.every((word) => startsWord(title, word))) points += 4
  if (!entry.page) points += 2
  return points
}

export function search(entries: SearchEntry[], query: string, limit = 12) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return entries.filter((entry) => !entry.page)
  return entries
    .map((entry, index) => ({ entry, index, points: score(entry, words) }))
    .filter((result) => result.points > 0)
    .sort((a, b) => b.points - a.points || a.index - b.index)
    .slice(0, limit)
    .map((result) => result.entry)
}
