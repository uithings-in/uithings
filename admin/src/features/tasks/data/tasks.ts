import { type Task } from './schema'

const titles = [
  'Fix login redirect loop',
  'Add component preview thumbnails',
  'Refactor dashboard metrics query',
  'Improve mobile navigation',
  'Update pricing page copy',
  'Add bulk delete confirmation',
  'Optimize image upload pipeline',
  'Polish empty states',
  'Add Figma copy feedback',
  'Document moderation flow',
]

const statuses = ['todo', 'in progress', 'done', 'canceled', 'backlog'] as const
const labels = ['bug', 'feature', 'documentation'] as const
const priorities = ['low', 'medium', 'high'] as const

export const tasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
  id: `TASK-${1000 + i}`,
  title: `${titles[i % titles.length]} #${Math.floor(i / titles.length) + 1}`,
  status: statuses[i % statuses.length],
  label: labels[i % labels.length],
  priority: priorities[i % priorities.length],
}))
