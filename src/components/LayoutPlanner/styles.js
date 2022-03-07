import styled from 'styled-components'
import { Box, Button } from '@mui/material'

export const Container = styled(Box)`
  position: relative;
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`

export const ToolsContainer = styled.div`
  position: absolute;
  margin-left: ${({ theme }) => theme.spacing(1)};
`

export const ToolButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(1)};
`
