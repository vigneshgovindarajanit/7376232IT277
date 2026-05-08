import { useEffect, useState } from 'react'
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { fetchNotifications, logEvent } from '../services/api'

const toneByType = {
  Placement: 'secondary',
  Result: 'primary',
  Event: 'success',
}

export default function Details({ session }) {
  const { notificationId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [notification, setNotification] = useState(state?.notification ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (notification || !session?.accessToken) {
      return
    }

    let cancelled = false

    async function loadNotification() {
      setLoading(true)
      setError('')

      try {
        const items = await fetchNotifications({
          token: session.accessToken,
          page: 1,
          limit: 100,
        })

        const match = items.find((item) => item.ID === notificationId)

        if (!cancelled) {
          if (match) {
            setNotification(match)
          } else {
            setError('Notification not found in the current API window.')
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadNotification()

    return () => {
      cancelled = true
    }
  }, [notification, notificationId, session?.accessToken])

  useEffect(() => {
    if (session?.accessToken && notification) {
      void logEvent({
        token: session.accessToken,
        level: 'info',
        packageName: 'page',
        message: `opened notification ${notification.ID}`,
      })
    }
  }, [notification, session?.accessToken])

  if (loading) {
    return <Loader label="Loading notification details..." />
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!notification) {
    if (!session?.accessToken) {
      return (
        <Alert severity="warning">
          Connect the API first to inspect notification details.
        </Alert>
      )
    }

    return <Alert severity="info">Notification details are unavailable.</Alert>
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'rgba(255, 253, 248, 0.94)',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(-1)}>
            Go back
          </Button>
          <Button component={Link} to="/" endIcon={<OpenInNewRoundedIcon />}>
            All notifications
          </Button>
        </Stack>

        <Box>
          <Chip
            label={notification.Type}
            color={toneByType[notification.Type] ?? 'default'}
            sx={{ mb: 2 }}
          />
          <Typography variant="h4" sx={{ color: 'text.primary', mb: 1.5 }}>
            {notification.Message}
          </Typography>
          <Typography color="text.secondary">
            Notification ID: {notification.ID}
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'rgba(15, 118, 110, 0.06)',
            border: '1px solid rgba(15, 118, 110, 0.12)',
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ color: 'text.primary' }}>
              Snapshot
            </Typography>
            <Typography>
              <strong>Timestamp:</strong> {notification.Timestamp}
            </Typography>
            <Typography>
              <strong>Priority weight:</strong>{' '}
              {notification.Type === 'Placement'
                ? 'High'
                : notification.Type === 'Result'
                  ? 'Medium'
                  : 'Normal'}
            </Typography>
            <Typography>
              <strong>Description:</strong> This item came from the protected campus notification
              feed and was opened from the frontend assessment dashboard. The card is marked as
              viewed as soon as you open this page.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Paper>
  )
}
