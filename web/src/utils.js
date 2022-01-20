import { useState, useEffect } from 'react'

export const wait = ms => new Promise(res => setTimeout(res, ms))

export const pollCompletion = (completionFn, ms=500) => new Promise(async res => {
  while (true) {
    const isComplete = await completionFn()
    if (isComplete) return res()
    else await wait(ms)
  }
})


export const fmt = (n) => {
  const r = Math.floor(n)
  if (r < 10) return '0' + r
  else return '' + r
}

export function times(n, fn) {
  const out = []
  for (let i = 0; i < n; i++) {
    out.push(fn(i))
  }
  return out
}