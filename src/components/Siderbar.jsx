import { Paper, Stack, Typography } from '@mui/material'

function Metric({ label, value }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'rgba(255,255,255,0.84)',
      }}
    >
      <Typography color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  )
}

export default function Siderbar({ summary, mode, topN }) {
  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: { lg: 320 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid rgba(15, 23, 42, 0.08)',
          backgroundColor: 'rgba(255, 253, 248, 0.9)',
        }}
      >
        <Typography variant="h6" sx={{ color: 'text.primary', mb: 1 }}>
          Snapshot
        </Typography>
        <Typography color="text.secondary">
          {mode === 'priority'
            ? `Showing up to the top ${topN} unread notifications.`
            : 'Tracking the current notification page and filter state.'}
        </Typography>
      </Paper>

      <Metric label="Visible items" value={summary.total} />
      <Metric label="Unread items" value={summary.unread} />
      <Metric label="Placement" value={summary.placement} />
      <Metric label="Result" value={summary.result} />
      <Metric label="Event" value={summary.event} />
    </Stack>
  )
}
