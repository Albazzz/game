import { useEffect, useRef, useState } from 'react'

export function AnswerInput({ disabled, pending, feedback, onSubmit, onSkip, prompt }: {
  disabled: boolean
  pending: boolean
  feedback: 'correct' | 'incorrect' | null
  onSubmit: (answer: string) => void
  onSkip?: () => void
  prompt?: string
}) {
  const [value, setValue] = useState('')
  const [composing, setComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (feedback) setValue('')
    if (!disabled && !pending) window.setTimeout(() => inputRef.current?.focus(), 40)
  }, [disabled, feedback, pending])

  const submit = () => {
    const answer = value.trim()
    if (!answer || disabled || pending || composing) return
    onSubmit(answer)
  }

  const skip = () => {
    if (disabled || pending) return
    setValue('')
    onSkip?.()
    inputRef.current?.focus()
  }

  return (
    <section className={`air-answer ${feedback ? `is-${feedback}` : ''}`} aria-label="Khu vực trả lời">
      <div className="air-answer__head">
        <div className="air-answer__mode"><span aria-hidden="true">文</span><div><strong>Dịch sang Romaji</strong><small>TĂNG 20% LỰC SÁT THƯƠNG</small></div></div>
        <span className="air-answer__enter" aria-hidden="true">↵</span>
      </div>
      <label htmlFor="air-answer-input">KANJI → HIRAGANA</label>
      <div className="air-answer__prompt jp">{prompt || '猫'}</div>
      <div className="air-answer__control">
        <input
          ref={inputRef}
          id="air-answer-input"
          value={value}
          disabled={disabled || pending}
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          placeholder="Nhập câu trả lời..."
          onChange={(event) => setValue(event.target.value)}
          onCompositionStart={() => setComposing(true)}
          onCompositionEnd={() => setComposing(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && !composing) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <button className="air-answer__skip" type="button" onClick={skip} disabled={disabled || pending}>BỎ QUA</button>
        <button className="air-answer__fire" type="button" onClick={submit} disabled={disabled || pending || !value.trim()}>
          <span aria-hidden="true">♨</span>{pending ? 'ĐANG TÍNH…' : 'KHAI HỎA'}
        </button>
      </div>
      <div className="air-answer__hint" aria-live="polite">
        {feedback === 'correct' ? 'Chính xác — snowball đã khai hỏa!' : feedback === 'incorrect' ? 'Chưa đúng, thử lại trước khi mục tiêu chạm tuyến.' : 'Enter để gửi · hỗ trợ bàn phím Japanese IME'}
      </div>
    </section>
  )
}
