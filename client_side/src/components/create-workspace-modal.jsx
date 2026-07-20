import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import Button from './ui/button'
import Input from './ui/input'
import Textarea from './ui/textarea'
import Label from './ui/label'
import { CATEGORIES } from '../lib/constants'
import { useCreateWorkspace } from '../hooks/use-workspaces'
import { X } from 'lucide-react'


const schema = z.object({
  workspaceName: z.string().min(5, 'Name must be at least 5 characters'),
  description: z.string().max(100, 'Description must be 100 characters or less'),
  mode: z.enum(['PUBLIC', 'PRIVATE'], { required_error: 'Please select a mode' }),
})

export default function CreateWorkspaceModal({ open, onClose }) {
  const [selectedCategories, setSelectedCategories] = useState([])
  const [categoryError, setCategoryError] = useState('')
  const create = useCreateWorkspace()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { workspaceName: '', description: '', mode: undefined },
  })

  const description = watch('description') || ''

  function toggleCategory(value) {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    )
    setCategoryError('')
  }

  async function onSubmit(data) {
    if (selectedCategories.length === 0) {
      setCategoryError('Select at least one category')
      return
    }
    setCategoryError('')
    create.mutate(
      { ...data, category: selectedCategories },
      {
        onSuccess: () => {
          reset()
          setSelectedCategories([])
          onClose()
        },
      }
    )
  }

  function handleClose() {
    reset()
    setSelectedCategories([])
    setCategoryError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>
        <DialogTitle>Create Workspace</DialogTitle>
        <DialogDescription>Set up a new collaborative workspace for your team.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Label htmlFor="workspaceName">Name</Label>
          <Input id="workspaceName" placeholder="My awesome workspace" {...register('workspaceName')} />
          {errors.workspaceName && (
            <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.workspaceName.message}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Label htmlFor="description">Description</Label>
          <div style={{ position: 'relative' }}>
            <Textarea
              id="description"
              placeholder="What's this workspace about?"
              rows={3}
              maxLength={100}
              {...register('description')}
            />
            <span style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {description.length}/100
            </span>
          </div>
          {errors.description && (
            <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.description.message}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Label>Mode</Label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['PUBLIC', 'PRIVATE'].map((mode) => (
              <label
                key={mode}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  border: `2px solid ${watch('mode') === mode ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: watch('mode') === mode ? 'rgba(10, 112, 117, 0.05)' : 'transparent',
                  color: watch('mode') === mode ? 'var(--accent)' : 'var(--text-secondary)',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                <input type="radio" value={mode} style={{ display: 'none' }} {...register('mode')} />
                {mode === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
              </label>
            ))}
          </div>
          {errors.mode && <p style={{ fontSize: '12px', color: 'var(--error)' }}>{errors.mode.message}</p>}
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            This cannot be changed after creation.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Label>Categories</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.includes(cat.value)
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '9999px',
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    backgroundColor: selected ? 'rgba(10, 112, 117, 0.1)' : 'transparent',
                    color: selected ? 'var(--accent)' : 'var(--text-secondary)',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                  {selected && <X size={12} />}
                </button>
              )
            })}
          </div>
          {categoryError && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '6px' }}>{categoryError}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending || selectedCategories.length === 0}>
            {create.isPending ? 'Creating...' : 'Create Workspace'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
