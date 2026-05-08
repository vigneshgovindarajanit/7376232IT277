import { Button, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        textAlign: 'center',
        border: '1px solid rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography variant="h3" sx={{ color: 'text.primary' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.primary' }}>
          This page does not exist
        </Typography>
        <Typography color="text.secondary">
          Return to the dashboard to continue the assessment flow.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to dashboard
        </Button>
      </Stack>
    </Paper>
  )
}
