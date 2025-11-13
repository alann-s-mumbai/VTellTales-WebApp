import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CreateStoryInput,
  StoryPageInput,
  StoryType,
  createStory,
  fetchStoryPages,
  fetchStoryTypes,
  saveStoryPage,
  updateStoryPage
} from '../services/api'

type CreatorStatus = 'idle' | 'submitting' | 'success' | 'error'
type StoryLoadStatus = 'idle' | 'loading' | 'error' | 'success'

interface DraftPage {
  id: string
  text: string
}

const makeDraftPage = (): DraftPage => ({
  id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
  text: ''
})

export function CreatorPage() {
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([])
  const [selectedType, setSelectedType] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pages, setPages] = useState<DraftPage[]>(() => [makeDraftPage()])
  const [status, setStatus] = useState<CreatorStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [existingStoryId, setExistingStoryId] = useState('')
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null)
  const [loadStatus, setLoadStatus] = useState<StoryLoadStatus>('idle')
  const [loadMessage, setLoadMessage] = useState<string>('')
  const [pageUpdateStatus, setPageUpdateStatus] = useState<StoryLoadStatus>('idle')
  const [pageUpdateMessage, setPageUpdateMessage] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function loadStoryTypes() {
      try {
        const fetched = await fetchStoryTypes()
        if (!cancelled) {
          setStoryTypes(fetched)
          setSelectedType((prev) => prev ?? fetched[0]?.stid ?? null)
        }
      } catch (error) {
        console.warn('Unable to load story types', error)
      }
    }

    loadStoryTypes()

    return () => {
      cancelled = true
    }
  }, [])

  const storyTypeLabel = useMemo(() => {
    const found = storyTypes.find((type) => type.stid === selectedType)
    return found?.sttype ?? 'Custom'
  }, [selectedType, storyTypes])

  const updatePage = (id: string, value: string) => {
    setPages((prev) =>
      prev.map((page) => (page.id === id ? { ...page, text: value } : page))
    )
  }

  const addPage = () => {
    setPages((prev) => {
      if (prev.length >= 20) return prev
      return [...prev, makeDraftPage()]
    })
  }

  const removePage = (id: string) => {
    setPages((prev) => (prev.length === 1 ? prev : prev.filter((page) => page.id !== id)))
  }

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setCoverFile(file)
  }

  const handleLoadExistingStory = async () => {
    const parsed = Number(existingStoryId)
    if (!existingStoryId.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setLoadStatus('error')
      setLoadMessage('Enter a valid story id before loading existing pages.')
      return
    }

    setLoadStatus('loading')
    setLoadMessage('')

    try {
      const fetchedPages = await fetchStoryPages(parsed)
      if (fetchedPages.length === 0) {
        setLoadStatus('error')
        setLoadMessage('No pages returned for this story.')
        return
      }

      const mappedPages = fetchedPages
        .sort((a, b) => a.pageno - b.pageno)
        .map(
          (page) =>
            ({
              id: `${page.storyid}-${page.pageno}`,
              text: page.pagestory ?? ''
            } as DraftPage)
        )

      setPages(mappedPages)
      setEditingStoryId(parsed)
      setLoadStatus('success')
      setLoadMessage(`Loaded ${mappedPages.length} pages from story #${parsed}.`)
      setPageUpdateStatus('idle')
      setPageUpdateMessage('')
    } catch (error) {
      setLoadStatus('error')
      setLoadMessage((error as Error).message)
    }
  }

  const handleUpdatePages = async () => {
    if (!editingStoryId) {
      setPageUpdateStatus('error')
      setPageUpdateMessage('Load a story before saving page updates.')
      return
    }

    const trimmedPages = pages
      .map((page) => ({ ...page, text: page.text.trim() }))
      .filter((page) => page.text.length > 0)

    if (trimmedPages.length === 0) {
      setPageUpdateStatus('error')
      setPageUpdateMessage('At least one non-empty page is required to save.')
      return
    }

    setPageUpdateStatus('loading')
    setPageUpdateMessage('')

    try {
      const payloads: StoryPageInput[] = trimmedPages.map((page, idx) => ({
        storyId: editingStoryId,
        pageNumber: idx + 1,
        content: page.text,
        pageType: 0,
        format: 'text'
      }))

      await Promise.all(payloads.map((payload) => updateStoryPage(payload)))

      setPageUpdateStatus('success')
      setPageUpdateMessage('Story pages updated in the backend.')
    } catch (error) {
      setPageUpdateStatus('error')
      setPageUpdateMessage((error as Error).message)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')
    setStatusMessage('')

    if (!title.trim()) {
      setStatus('error')
      setStatusMessage('Please add a story title before submitting.')
      return
    }

    const trimmedPages = pages
      .map((page) => ({ ...page, text: page.text.trim() }))
      .filter((page) => page.text.length > 0)

    if (trimmedPages.length === 0) {
      setStatus('error')
      setStatusMessage('Add at least one written page for the story.')
      return
    }

    if (trimmedPages.length > 50) {
      setStatus('error')
      setStatusMessage('Please limit stories to 50 pages.')
      return
    }

    const storyInput: CreateStoryInput = {
      title: title.trim(),
      description: description.trim(),
      coverFile,
      storyTypeId: selectedType ?? undefined,
      storyType: storyTypeLabel,
      pageCount: trimmedPages.length
    }

    try {
      const storyId = await createStory(storyInput)
      const pagePayloads: StoryPageInput[] = trimmedPages.map((page, idx) => ({
        storyId,
        pageNumber: idx + 1,
        content: page.text,
        format: 'text',
        pageType: 0
      }))

      await Promise.all(pagePayloads.map((payload) => saveStoryPage(payload)))

      setStatus('success')
      setStatusMessage(`Story #${storyId} created. You can now publish or edit it.`)
      setTitle('')
      setDescription('')
      setCoverFile(null)
      setPages([makeDraftPage()])
      setEditingStoryId(storyId)
      setExistingStoryId(storyId.toString())
      setPageUpdateStatus('idle')
      setPageUpdateMessage('')
    } catch (error) {
      setStatus('error')
      setStatusMessage((error as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-400">Educator creator</p>
          <h1 className="text-4xl font-bold text-gray-900">Create interactive VTellTales stories</h1>
          <p className="text-gray-600">
            This experience targets educators—upload a cover, craft up to 20 pages of text, and publish
            directly to the backend via <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">SaveStory</code>{' '}
            and <code className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono">SaveStorypage</code>.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] bg-white/80 p-8 shadow-xl backdrop-blur-sm">
          {statusMessage && (
            <div
              className={`rounded-2xl border p-4 text-sm ${
                status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {statusMessage}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Story title
              <input
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="A Day at the Moon Farm"
                required
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Story type
              <select
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                value={selectedType ?? ''}
                onChange={(event) => setSelectedType(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">Custom</option>
                {storyTypes.map((type) => (
                  <option key={type.stid} value={type.stid}>
                    {type.sttype}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-gray-700">
            Description
            <textarea
              className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Use this space to describe the reading level, learning goals, or anything teachers should know."
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-gray-700">
            Cover image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="text-sm"
            />
            {coverFile && (
              <p className="text-xs text-gray-500">Selected: {coverFile.name}</p>
            )}
          </label>

          <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex-1 space-y-1 text-sm font-semibold text-gray-700">
                Existing story ID
                <input
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                  placeholder="Load story pages to edit"
                  value={existingStoryId}
                  onChange={(event) => setExistingStoryId(event.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={handleLoadExistingStory}
                disabled={loadStatus === 'loading'}
                className="rounded-2xl border border-primary-blue bg-primary-blue/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-blue transition hover:bg-primary-blue/20 disabled:opacity-60"
              >
                {loadStatus === 'loading' ? 'Loading…' : 'Load story pages'}
              </button>
            </div>
            {loadMessage && (
              <p className={`text-sm ${loadStatus === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                {loadMessage}
              </p>
            )}
            {editingStoryId && (
              <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-primary-blue/60 bg-primary-blue/5 p-3 text-xs text-primary-blue">
                <p>Editing story #{editingStoryId}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleUpdatePages}
                    disabled={pageUpdateStatus === 'loading'}
                    className="rounded-full border border-primary-blue bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-blue transition hover:bg-primary-blue/10 disabled:opacity-60"
                  >
                    {pageUpdateStatus === 'loading' ? 'Saving pages…' : 'Save page updates'}
                  </button>
                  {pageUpdateMessage && (
                    <span className={`text-[10px] ${pageUpdateStatus === 'error' ? 'text-red-600' : 'text-primary-blue/80'}`}>
                      {pageUpdateMessage}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pages</h2>
              <button
                type="button"
                onClick={addPage}
                className="rounded-2xl border border-primary-blue bg-primary-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-blue transition hover:bg-primary-blue/20"
              >
                Add page
              </button>
            </div>

            <div className="space-y-4">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="relative space-y-3 rounded-3xl border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                      Page {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                      disabled={pages.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/30"
                    rows={4}
                    value={page.text}
                    onChange={(event) => updatePage(page.id, event.target.value)}
                    placeholder="Write the page content (dialogue, narration, etc.)"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <small className="text-xs uppercase tracking-[0.4em] text-gray-400">
              Story engine notes
            </small>
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600">
              Only the first {pages.length} pages are sent during creation. After submitting, you can
              edit the story in the backend admin panel or re-run this form to append more pages one
              at a time.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
              Story type: {storyTypeLabel}
            </span>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="rounded-3xl bg-gradient-to-r from-primary-blue to-accent-purple px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Submitting story…' : 'Save story to backend'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
