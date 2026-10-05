import { createContext, useContext } from 'react'
import { DEFAULT_CONTENT } from '../data/content.js'

export const ContentContext = createContext(DEFAULT_CONTENT)

export function useContent() {
  return useContext(ContentContext)
}
