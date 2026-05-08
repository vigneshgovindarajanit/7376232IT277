import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import Loader from '../components/Loader'
import Card from '../components/Card'
import Siderbar from '../components/Siderbar'
import { fetchNotifications, logEvent } from '../services/api'

const VIEWED_STORAGE_KEY = 'affordmed-viewed-notifications'
const notificationTypes = ['All', 'Placement', 'Result', 'Event']
const demoNotifications = [
  {
    ID: 'd146095a-0d86-4a34-9e69-3900a14576bc',
    Type: 'Result',
    Message: 'mid-sem',
    Timestamp: '2026-04-22 17:51:30',
  },
  {
    ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64b0',
    Type: 'Placement',
    Message: 'CSX Corporation hiring',
    Timestamp: '2026-04-22 17:51:18',
  },
  {
    ID: '81589ada-0ad3-4f77-9554-f52fb558e09d',
    Type: 'Event',
    Message: 'farewell',
    Timestamp: '2026-04-22 17:51:06',
  },
  {
    ID: '0005513a-142b-4bbc-8678-eefec65e1ede',
    Type: 'Result',
    Message: 'mid-sem',
    Timestamp: '2026-04-22 17:50:54',
  },
  {
    ID: 'ea836726-c25e-4f21-a72f-544a6af8a37f',
    Type: 'Result',
    Message: 'project-review',
    Timestamp: '2026-04-22 17:50:42',
  },
  {
    ID: '003cb427-8fc6-47f7-bb00-be228f6b0d2c',
    Type: 'Result',
    Message: 'external',
    Timestamp: '2026-04-22 17:50:30',
  },
  {
    ID: 'e5c4ff20-31bf-4d40-8f02-72fda59e8918',
    Type: 'Result',
    Message: 'project-review',
    Timestamp: '2026-04-22 17:50:18',
  },
  {
    ID: '1cfce5ee-ad37-4894-8946-d707627176a5',
    Type: 'Event',
    Message: 'tech-fest',
    Timestamp: '2026-04-22 17:50:06',
  },
  {
    ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8',
    Type: 'Result',
    Message: 'project-review',
    Timestamp: '2026-04-22 17:49:54',
  },
  {
    ID: '8a7412bd-6065-4d09-8501-a37f11cc848b',
    Type: 'Placement',
    Message: 'Advanced Micro Devices Inc. hiring',
    Timestamp: '2026-04-22 17:49:42',
  },
]
const priorityWeights = {
  Placement: 3,
  Result: 2,
  Event: 1,
}

function loadViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveViewedIds(ids) {
  localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(ids))
}

function getPriorityScore(notification) {
  const weight = priorityWeights[notification.Type] ?? 0
  const recency = new Date(notification.Timestamp).getTime()
  return weight * 10 ** 14 + recency
}

function filterTypeValue(type) {
  return type === 'All' ? '' : type
}

export default function Home({ session, mode }) {
  const [notifications, setNotifications] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(mode === 'priority' ? 100 : 10)
  const [filter, setFilter] = useState('All')
  const [topN, setTopN] = useState(10)
  const [viewedIds, setViewedIds] = useState(() => loadViewedIds())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [liveHasMore, setLiveHasMore] = useState(false)

  useEffect(() => {
    if (!session?.accessToken) return

    let cancelled = false

    async function loadNotifications() {
      setLoading(true)
      setError('')

      try {
        const items = await fetchNotifications({
          token: session.accessToken,
          page,
          limit: mode === 'priority' ? 100 : limit,
          notificationType: filterTypeValue(filter),
        })

        if (!cancelled) {
          setNotifications(items)
          setLiveHasMore(mode === 'priority' ? false : items.length === limit)
        }

        void logEvent({
          token: session.accessToken,
          level: 'info',
          packageName: 'api',
          message: `loaded ${items.length} notifications for ${mode} view`,
        })
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message)
          setLiveHasMore(false)
        }

        void logEvent({
          token: session.accessToken,
          level: 'error',
          packageName: 'api',
          message: `notification fetch failed: ${fetchError.message}`,
        })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      cancelled = true
    }
  }, [filter, limit, mode, page, session?.accessToken])

  useEffect(() => {
    saveViewedIds(viewedIds)
  }, [viewedIds])

  const rankedNotifications = useMemo(
    () =>
      [...(session?.accessToken ? notifications : demoNotifications)].sort(
        (left, right) => getPriorityScore(right) - getPriorityScore(left),
      ),
    [notifications, session?.accessToken],
  )

  const sourceNotifications = useMemo(() => {
    if (session?.accessToken) {
      return notifications
    }

    const filtered = demoNotifications.filter((notification) =>
      filter === 'All' ? true : notification.Type === filter,
    )

    if (mode === 'priority') {
      return filtered
    }

    const start = (page - 1) * limit
    const end = start + limit
    return filtered.slice(start, end)
  }, [filter, limit, mode, notifications, page, session?.accessToken])

  const hasMore = useMemo(() => {
    if (session?.accessToken) {
      return liveHasMore
    }

    if (mode === 'priority') {
      return false
    }

    const filtered = demoNotifications.filter((notification) =>
      filter === 'All' ? true : notification.Type === filter,
    )

    return page * limit < filtered.length
  }, [filter, limit, liveHasMore, mode, page, session?.accessToken])

  const visibleNotifications = useMemo(() => {
    if (mode === 'priority') {
      return rankedNotifications
        .filter((notification) => !viewedIds.includes(notification.ID))
        .slice(0, topN)
    }

    return sourceNotifications
  }, [mode, rankedNotifications, sourceNotifications, topN, viewedIds])

  const summary = useMemo(() => {
    const source = mode === 'priority' ? rankedNotifications : sourceNotifications

    return {
      total: source.length,
      unread: source.filter((item) => !viewedIds.includes(item.ID)).length,
      placement: source.filter((item) => item.Type === 'Placement').length,
      result: source.filter((item) => item.Type === 'Result').length,
      event: source.filter((item) => item.Type === 'Event').length,
    }
  }, [mode, rankedNotifications, sourceNotifications, viewedIds])

  function markViewed(id) {
    setViewedIds((current) => (current.includes(id) ? current : [...current, id]))
  }

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="flex-start">
      <Box sx={{ flex: 1, width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            backgroundColor: 'rgba(255, 253, 248, 0.92)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography variant="h4" sx={{ color: 'text.primary', mb: 1 }}>
                {mode === 'priority' ? 'Priority Inbox' : 'All Notifications'}
              </Typography>
              <Typography color="text.secondary">
                {mode === 'priority'
                  ? 'Unread items are ranked by placement > result > event, then by recency.'
                  : 'Browse the protected notification feed with filters and pagination.'}
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: 280 }}>
              <FormControl fullWidth size="small">
                <InputLabel id={`${mode}-type-filter`}>Type</InputLabel>
                <Select
                  labelId={`${mode}-type-filter`}
                  value={filter}
                  label="Type"
                  onChange={(event) => {
                    setPage(1)
                    setFilter(event.target.value)
                  }}
                >
                  {notificationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {mode === 'all' ? (
                <FormControl fullWidth size="small">
                  <InputLabel id="page-size-filter">Page Size</InputLabel>
                  <Select
                    labelId="page-size-filter"
                    value={limit}
                    label="Page Size"
                    onChange={(event) => {
                      setPage(1)
                      setLimit(event.target.value)
                    }}
                  >
                    {[10, 15, 20, 25].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
            </Stack>
          </Stack>

          {mode === 'priority' ? (
            <Box sx={{ mt: 3, maxWidth: 340 }}>
              <Typography gutterBottom color="text.secondary">
                Top unread notifications to display: {topN}
              </Typography>
              <Slider
                min={5}
                max={20}
                step={1}
                value={topN}
                marks={[5, 10, 15, 20].map((value) => ({ value, label: String(value) }))}
                onChange={(_, value) => setTopN(value)}
              />
            </Box>
          ) : null}
        </Paper>

        {!session?.accessToken ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            You are currently seeing demo notifications from the assessment brief. Connect the API
            with your own credentials to switch to the protected live feed.
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? <Loader label="Loading notifications..." /> : null}

        {!loading ? (
          <Stack spacing={2}>
            {visibleNotifications.length ? (
              visibleNotifications.map((notification, index) => (
                <Card
                  key={notification.ID}
                  notification={notification}
                  isViewed={viewedIds.includes(notification.ID)}
                  showPriorityRank={mode === 'priority'}
                  priorityRank={index + 1}
                  onOpen={() => markViewed(notification.ID)}
                />
              ))
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '1px dashed rgba(15, 23, 42, 0.14)',
                  backgroundColor: 'rgba(255,255,255,0.78)',
                }}
              >
                <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
                  No notifications found
                </Typography>
                <Typography color="text.secondary">
                  Try changing the type filter or reconnecting the API session.
                </Typography>
              </Paper>
            )}
          </Stack>
        ) : null}

        {mode === 'all' ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
            <Typography color="text.secondary">Page {page}</Typography>
            <Stack direction="row" spacing={1}>
              <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </Button>
              <Pagination
                color="primary"
                page={page}
                count={hasMore ? page + 1 : page}
                onChange={(_, value) => setPage(value)}
              />
              <Button disabled={!hasMore} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </Stack>
          </Stack>
        ) : null}

        {mode === 'priority' && visibleNotifications.length ? (
          <Button
            sx={{ mt: 3 }}
            variant="outlined"
            onClick={() => {
              setViewedIds([])
              saveViewedIds([])
            }}
          >
            Reset viewed state
          </Button>
        ) : null}
      </Box>

      <Siderbar summary={summary} mode={mode} topN={topN} />
    </Stack>
  )
}
