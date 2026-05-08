import { CircularProgress, Paper, Stack, Typography } from '@mui/material'

export default function Loader({ label = 'Loading...' }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: 'rgba(255,255,255,0.84)',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress color="primary" />
        <Typography color="text.secondary">{label}</Typography>
      </Stack>
    </Paper>
  )
}
