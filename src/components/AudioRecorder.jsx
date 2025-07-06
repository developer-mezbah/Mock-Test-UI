"use client"

import { useState, useRef, useEffect } from "react"
import { FaMicrophone, FaStop, FaPlay, FaPause } from "react-icons/fa"

const AudioRecorder = ({ onRecordingComplete, isRecording, setIsRecording }) => {
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastRecording, setLastRecording] = useState(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        setLastRecording(URL.createObjectURL(audioBlob))
        onRecordingComplete(audioBlob)
        setAudioChunks([])
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Please allow microphone access to record your response.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)
    }
  }

  const playRecording = () => {
    if (audioRef.current && lastRecording) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Record Your Response</h3>

        <div className="flex justify-center items-center space-x-4 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition duration-200"
            >
              <FaMicrophone className="text-2xl" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-full transition duration-200 animate-pulse"
            >
              <FaStop className="text-2xl" />
            </button>
          )}

          {lastRecording && (
            <button
              onClick={playRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition duration-200"
            >
              {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
            </button>
          )}
        </div>

        {isRecording && (
          <div className="text-red-600 font-mono text-xl mb-2">Recording: {formatTime(recordingTime)}</div>
        )}

        <div className="text-sm text-gray-600">
          {isRecording ? (
            <p>Click the stop button when you finish speaking</p>
          ) : (
            <p>Click the microphone to start recording your answer</p>
          )}
        </div>

        {lastRecording && (
          <audio ref={audioRef} src={lastRecording} onEnded={() => setIsPlaying(false)} className="hidden" />
        )}
      </div>
    </div>
  )
}

export default AudioRecorder
