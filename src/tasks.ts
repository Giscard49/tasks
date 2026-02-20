import { supabase } from './supabaseClient'

// ─────────────────────────────────────────
//  ADD a new task to the database
// ─────────────────────────────────────────
export async function addTask(
  name: string,
  priority: 'high' | 'medium' | 'low',
  due_date: string,   // format: "2025-03-15"
  due_time: string    // format: "14:30"
) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ name, priority, due_date, due_time }])
    .select()

  if (error) {
    console.error('Failed to add task:', error.message)
    return null
  }
  return data[0]
}

// ─────────────────────────────────────────
// GET all tasks from the database
// ─────────────────────────────────────────
export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get tasks:', error.message)
    return []
  }
  return data
}

// ─────────────────────────────────────────
//  UPDATE an existing task
// ─────────────────────────────────────────
export async function updateTask(
  taskId: string,
  updates: {
    name?: string
    priority?: 'high' | 'medium' | 'low'
    due_date?: string
    due_time?: string
    is_completed?: boolean
  }
) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()

  if (error) {
    console.error('Failed to update task:', error.message)
    return null
  }
  return data[0]
}

// ─────────────────────────────────────────
// DELETE a task
// ─────────────────────────────────────────
export async function deleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Failed to delete task:', error.message)
    return false
  }
  return true
}