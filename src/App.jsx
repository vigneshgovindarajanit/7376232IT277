import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Home from './pages/Home'
import Details from './pages/Details'
import NotFound from './pages/NotFound'
import {
  authenticateCandidate,
  loadStoredSession,
  logEvent,
  registerCandidate,
  saveStoredSession,
} from './services/api'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
    },
    secondary: {
      main: '#c2410c',
    },
    background: {
      default: '#f3efe7',
      paper: '#fffdf8',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
  },
})

const initialRegistrationForm = {
  email: '',
  name: '',
  mobileNo: '',
  githubUsername: '',
  rollNo: '',
  accessCode: '',
}

const initialAuthForm = {
  email: '',
  name: '',
  rollNo: '',
  accessCode: '',
  clientID: '',
  clientSecret: '',
}

function AppShell() {
  const [session, setSession] = useState(() => loadStoredSession())
  const storedProfile = loadStoredSession()?.profile ?? {}
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [registerForm, setRegisterForm] = useState(() => ({
    ...initialRegistrationForm,
    email: storedProfile.email ?? '',
    name: storedProfile.name ?? '',
    mobileNo: storedProfile.mobileNo ?? '',
    githubUsername: storedProfile.githubUsername ?? '',
    rollNo: storedProfile.rollNo ?? '',
    accessCode: storedProfile.accessCode ?? '',
  }))
  const [authForm, setAuthForm] = useState(() => ({
    ...initialAuthForm,
    email: storedProfile.email ?? '',
    name: storedProfile.name ?? '',
    rollNo: storedProfile.rollNo ?? '',
    accessCode: storedProfile.accessCode ?? '',
    clientID: storedProfile.clientID ?? '',
    clientSecret: storedProfile.clientSecret ?? '',
  }))
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (session?.accessToken) {
      void logEvent({
        token: session.accessToken,
        level: 'info',
        packageName: 'page',
        message: `navigated to ${location.pathname}`,
      })
    }
  }, [location.pathname, session?.accessToken])

  const navItems = useMemo(
    () => [
      { to: '/', label: 'All Notifications' },
      { to: '/priority', label: 'Priority Inbox' },
    ],
    [],
  )

  async function handleRegister() {
    setAuthBusy(true)
    setAuthError('')
    setAuthSuccess('')

    try {
      const response = await registerCandidate(registerForm)
      const nextSession = {
        ...session,
        profile: {
          ...response,
          mobileNo: registerForm.mobileNo,
          githubUsername: registerForm.githubUsername,
        },
      }

      setSession(nextSession)
      saveStoredSession(nextSession)
      setRegisterForm({
        ...registerForm,
        email: response.email,
        name: response.name,
        rollNo: response.rollNo,
        accessCode: response.accessCode,
      })
      setAuthForm({
        ...initialAuthForm,
        email: response.email,
        name: response.name,
        rollNo: response.rollNo,
        accessCode: response.accessCode,
        clientID: response.clientID,
        clientSecret: response.clientSecret,
      })
      setAuthSuccess(
        'Registration complete. Your Client ID and Client Secret have been saved locally in this browser.',
      )
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleAuthenticate() {
    setAuthBusy(true)
    setAuthError('')
    setAuthSuccess('')

    try {
      const response = await authenticateCandidate(authForm)
      const nextSession = {
        accessToken: response.access_token,
        tokenType: response.token_type,
        expiresIn: response.expires_in,
        profile: {
          ...session?.profile,
          ...authForm,
        },
      }

      setSession(nextSession)
      saveStoredSession(nextSession)
      setRegisterForm({
        ...registerForm,
        email: authForm.email,
        name: authForm.name,
        rollNo: authForm.rollNo,
        accessCode: authForm.accessCode,
      })
      setAuthSuccess('Authentication successful. Protected APIs are ready to use.')
      setAuthOpen(false)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  function handleLogout() {
    saveStoredSession(null)
    setSession(null)
    navigate('/')
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 30%), radial-gradient(circle at top right, rgba(194,65,12,0.14), transparent 24%), #f3efe7',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Campus Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frontend assessment workspace
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={{
                    color: 'text.primary',
                    px: 2,
                    borderRadius: 999,
                    '&.active': {
                      bgcolor: 'rgba(15, 118, 110, 0.12)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<LoginRoundedIcon />}
                onClick={() => setAuthOpen(true)}
              >
                {session?.accessToken ? 'Update API Access' : 'Connect API'}
              </Button>
              {session?.accessToken ? (
                <Button
                  color="secondary"
                  variant="contained"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              ) : null}
            </Stack>
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 260, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Navigate
            </Typography>
            <Stack spacing={1}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Drawer>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h3" sx={{ color: 'text.primary', mb: 1 }}>
                  Responsive notification dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820 }}>
                  Review every notification, separate unread high-priority items into their own
                  page, and keep viewed state persistent between sessions.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="Runs on localhost:3000" color="primary" variant="outlined" />
                <Chip label="Protected API ready" color={session?.accessToken ? 'success' : 'default'} />
                <Chip label="Viewed tracking enabled" color="secondary" variant="outlined" />
              </Stack>
            </Stack>
            {!session?.accessToken ? (
              <Alert severity="info">
                Register once with your own assessment details, then authenticate to unlock the
                notification and logging APIs.
              </Alert>
            ) : null}
          </Stack>

          <Routes>
            <Route path="/" element={<Home session={session} mode="all" />} />
            <Route path="/priority" element={<Home session={session} mode="priority" />} />
            <Route path="/notifications/:notificationId" element={<Details session={session} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>

        <Dialog open={authOpen} onClose={() => setAuthOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Assessment API setup</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={3}>
              {authError ? <Alert severity="error">{authError}</Alert> : null}
              {authSuccess ? <Alert severity="success">{authSuccess}</Alert> : null}

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  1. Register once
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Use your own email, roll number, GitHub username, and access code from the
                  assessment email.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={registerForm.mobileNo}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        mobileNo: event.target.value,
                      }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="GitHub Username"
                    value={registerForm.githubUsername}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        githubUsername: event.target.value,
                      }))
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Roll Number"
                    value={registerForm.rollNo}
                    onChange={(event) =>
                      setRegisterForm((current) => ({ ...current, rollNo: event.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Access Code"
                    value={registerForm.accessCode}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        accessCode: event.target.value,
                      }))
                    }
                  />
                </Stack>
                <Button sx={{ mt: 2 }} variant="contained" onClick={handleRegister} disabled={authBusy}>
                  Register candidate
                </Button>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  2. Authenticate
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Paste the saved Client ID and Client Secret if you already registered earlier.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={authForm.name}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    value={authForm.email}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Roll Number"
                    value={authForm.rollNo}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, rollNo: event.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Access Code"
                    value={authForm.accessCode}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, accessCode: event.target.value }))
                    }
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={authForm.clientID}
                    onChange={(event) =>
                      setAuthForm((current) => ({ ...current, clientID: event.target.value }))
                    }
                  />
                  <TextField
                    fullWidth
                    label="Client Secret"
                    value={authForm.clientSecret}
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        clientSecret: event.target.value,
                      }))
                    }
                  />
                </Stack>
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="secondary"
                  onClick={handleAuthenticate}
                  disabled={authBusy}
                >
                  Get bearer token
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuthOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
