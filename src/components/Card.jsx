import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded'
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded'
import DraftsRoundedIcon from '@mui/icons-material/DraftsRounded'
import { Link } from 'react-router-dom'

const chipTone = {
  Placement: 'secondary',
  Result: 'primary',
  Event: 'success',
}

export default function Card({
  notification,
  isViewed,
  showPriorityRank = false,
  priorityRank,
  onOpen,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.25, md: 2.75 },
        border: '1px solid rgba(15, 23, 42, 0.08)',
        backgroundColor: isViewed ? 'rgba(255,255,255,0.78)' : 'rgba(255, 252, 240, 0.98)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {showPriorityRank ? <Chip label={`Rank #${priorityRank}`} variant="outlined" /> : null}
            <Chip label={notification.Type} color={chipTone[notification.Type] ?? 'default'} />
            <Chip
              icon={isViewed ? <DraftsRoundedIcon /> : <MarkEmailUnreadRoundedIcon />}
              label={isViewed ? 'Viewed' : 'New'}
              color={isViewed ? 'default' : 'warning'}
              variant={isViewed ? 'outlined' : 'filled'}
            />
          </Stack>
          <Typography color="text.secondary">{notification.Timestamp}</Typography>
        </Stack>

        <BoxText title={notification.Message} description={notification.ID} />

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Typography color="text.secondary">
            Priority class:{' '}
            <strong>
              {notification.Type === 'Placement'
                ? 'High'
                : notification.Type === 'Result'
                  ? 'Medium'
                  : 'Normal'}
            </strong>
          </Typography>
          <Button
            component={Link}
            to={`/notifications/${notification.ID}`}
            state={{ notification }}
            variant="contained"
            endIcon={<LaunchRoundedIcon />}
            onClick={onOpen}
          >
            Open details
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

function BoxText({ title, description }) {
  return (
    <Stack spacing={1}>
      <Typography variant="h6" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ wordBreak: 'break-word' }}>
        {description}
      </Typography>
    </Stack>
  )
}
