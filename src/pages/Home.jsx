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
      [...notifications].sort((left, right) => getPriorityScore(right) - getPriorityScore(left)),
    [notifications],
  )

  const visibleNotifications = useMemo(() => {
    if (!session?.accessToken) {
      return []
    }

    if (mode === 'priority') {
      return rankedNotifications
        .filter((notification) => !viewedIds.includes(notification.ID))
        .slice(0, topN)
    }

    return notifications
  }, [mode, notifications, rankedNotifications, session?.accessToken, topN, viewedIds])

  const summary = useMemo(() => {
    if (!session?.accessToken) {
      return {
        total: 0,
        unread: 0,
        placement: 0,
        result: 0,
        event: 0,
      }
    }

    const source = mode === 'priority' ? rankedNotifications : notifications

    return {
      total: source.length,
      unread: source.filter((item) => !viewedIds.includes(item.ID)).length,
      placement: source.filter((item) => item.Type === 'Placement').length,
      result: source.filter((item) => item.Type === 'Result').length,
      event: source.filter((item) => item.Type === 'Event').length,
    }
  }, [mode, notifications, rankedNotifications, session?.accessToken, viewedIds])

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
          <Alert severity="warning">
            Connect the assessment API first. The notifications and logging endpoints require a
            bearer token.
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : null}

        {loading ? <Loader label="Loading notifications..." /> : null}

        {!loading && session?.accessToken ? (
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

        {mode === 'all' && session?.accessToken ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
            <Typography color="text.secondary">Page {page}</Typography>
            <Pagination
              color="primary"
              page={page}
              count={10}
              onChange={(_, value) => setPage(value)}
            />
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
