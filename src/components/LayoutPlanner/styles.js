import styled from 'styled-components'
import { Box, Button } from '@mui/material'

export const Container = styled(Box)`
  position: relative;
  flex: 1;
  overflow: hidden;
`

export const ToolsContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ theme }) => theme.spacing(1)};
`

export const ToolButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(1)};
`
