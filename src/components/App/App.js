import React from 'react'
import { Container, AppBar, Toolbar, Typography } from '@mui/material'

import LayoutPlanner from '../LayoutPlanner'

const App = () => {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <AppBar position="static" elevation={0}>
        <Toolbar variant="dense">
          <Typography variant="body1" color="inherit" component="div">
            React Layout Planner
          </Typography>
        </Toolbar>
      </AppBar>
      <LayoutPlanner />
    </Container>
  )
}

export default App
