import { useState, useEffect, useCallback, useRef } from "react"
import {
  RiRefreshLine,
  RiMicLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiPlayLine,
  RiStopLine,
  RiVolumeUpLine,
  RiBookOpenLine,
  RiChatVoiceLine,
  RiQuestionLine,
  RiTrophyLine,
  RiStarLine,
  RiLightbulbLine,
  RiSpeakLine,
  RiUser3Line,
  RiGlobalLine,
  RiHeadphoneLine,
  RiFileTextLine,
  RiBarChartLine,
  RiThumbUpLine,
  RiAlarmLine,
  RiRecordCircleLine,
  RiFlag2Line,
  RiVolumeDownLine,
  RiVolumeMuteLine,
  RiCloseLine,
  RiEditLine,
} from "react-icons/ri"
import "./App.css"

// Speech Recognition Hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
        recognitionRef.current = new SpeechRecognition()
        const recognition = recognitionRef.current

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " "
            }
          }
          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript)
          }
        }

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      recognitionRef.current.start()
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// Text-to-Speech Hook
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(0.8)

  useEffect(() => {
    if ("speechSynthesis" in window) {
      setIsSupported(true)
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        setVoices(availableVoices)
        const englishVoice =
          availableVoices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Google")) ||
          availableVoices.find((voice) => voice.lang.startsWith("en"))
        if (englishVoice) {
          setSelectedVoice(englishVoice)
        }
      }
      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speak = useCallback(
    (text) => {
      if (!isSupported || !text || isSpeaking) return
      speechSynthesis.cancel()
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
        speechSynthesis.speak(utterance)
      }, 100)
    },
    [isSupported, selectedVoice, rate, pitch, volume, isSpeaking],
  )

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
  }
}

// Audio Settings Component
const AudioSettings = ({ isOpen, onClose, textToSpeech }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Audio Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
            <select
              value={textToSpeech.selectedVoice?.name || ""}
              onChange={(e) => {
                const voice = textToSpeech.voices.find((v) => v.name === e.target.value)
                textToSpeech.setSelectedVoice(voice)
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {textToSpeech.voices
                .filter((voice) => voice.lang.startsWith("en"))
                .map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed: {textToSpeech.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={textToSpeech.rate}
              onChange={(e) => textToSpeech.setRate(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch: {textToSpeech.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={textToSpeech.pitch}
              onChange={(e) => textToSpeech.setPitch(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(textToSpeech.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={textToSpeech.volume}
              onChange={(e) => textToSpeech.setVolume(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={() => textToSpeech.speak("This is a test of the text to speech system.")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RiVolumeUpLine className="w-4 h-4" />
            Test Voice
          </button>
        </div>
      </div>
    </div>
  )
}

// Sample data for IELTS Speaking Test
const testData = {
  part1: {
    title: "Part 1: Introduction and Interview",
    duration: 300,
    color: "blue",
    questions: [
      "What's your full name?",
      "Can I see your identification?",
      "Where are you from?",
      "Do you work or study?",
      "What do you like about your hometown?",
      "Do you enjoy reading books? Why or why not?",
      "What kind of books do you prefer?",
      "How often do you read?",
      "Do you think reading is important for children?",
      "What was your favorite subject in school?",
      "Do you still keep in touch with your school friends?",
    ],
  },
  part2: {
    title: "Part 2: Long Turn",
    prepTime: 60,
    speakTime: 120,
    color: "yellow",
    cueCard: {
      topic: "Describe a memorable journey you have taken",
      points: [
        "Where you went",
        "Who you went with",
        "What you did there",
        "And explain why this journey was memorable for you",
      ],
    },
  },
  part3: {
    title: "Part 3: Discussion",
    duration: 300,
    color: "purple",
    questions: [
      "How has traveling changed over the past few decades?",
      "What are the benefits of traveling for young people?",
      "Do you think people travel too much nowadays?",
      "How might technology change the way we travel in the future?",
      "What are the environmental impacts of tourism?",
      "Should governments promote domestic tourism?",
      "How important is it to learn about local culture when traveling?",
    ],
  },
}

const Timer = ({ seconds, isActive, onTimeUp, showWarning = true }) => {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1
          if (newTime <= 0) {
            return 0
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      const timeoutId = setTimeout(() => {
        onTimeUp()
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [timeLeft, isActive, onTimeUp])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = () => {
    if (timeLeft <= 10) return "text-red-600 bg-red-50 border-red-300"
    if (timeLeft <= 30 && showWarning) return "text-orange-600 bg-orange-50 border-orange-300"
    return "text-green-600 bg-green-50 border-green-300"
  }

  return (
    <div
      className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full border-2 font-mono text-sm sm:text-lg font-bold sm:mx-0 mx-auto ${getTimerColor()}`}
    >
      <RiAlarmLine className="w-4 h-4 sm:w-6 sm:h-6" />
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

const RecordingControls = ({ isRecording, onToggleRecording, onReset, transcript, isListening }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={onToggleRecording}
          className={`flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto ${isRecording
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-200"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-200"
            }`}
        >
          {isRecording ? (
            <>
              <RiStopLine className="w-4 h-4 sm:w-6 sm:h-6" />
              Stop Recording
            </>
          ) : (
            <>
              <RiRecordCircleLine className="w-4 h-4 sm:w-6 sm:h-6" />
              Start Recording
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto"
        >
          <RiRefreshLine className="w-4 h-4 sm:w-5 sm:h-5" />
          Reset
        </button>
      </div>

      {/* Live Transcript Display */}
      {isListening && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">Live Transcript:</span>
          </div>
          <p className="text-gray-700 min-h-[2rem] italic">{transcript || "Start speaking..."}</p>
        </div>
      )}
    </div>
  )
}

const ProgressBar = ({ current, total, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
      <div
        className={`${colorClasses[color]} h-2 sm:h-3 rounded-full transition-all duration-500 ease-out shadow-sm`}
        style={{ width: `${(current / total) * 100}%` }}
      ></div>
    </div>
  )
}

const Part1Component = ({ onComplete, testResponses, setTestResponses }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [autoSpeech, setAutoSpeech] = useState(true)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const textToSpeech = useTextToSpeech()
  const speechRecognition = useSpeechRecognition()

  // Auto-speak question when it changes
  useEffect(() => {
    if (autoSpeech && textToSpeech.isSupported && !textToSpeech.isSpeaking) {
      const questionText = testData.part1.questions[currentQuestion]
      const timeoutId = setTimeout(() => {
        if (autoSpeech && !textToSpeech.isSpeaking) {
          textToSpeech.speak(questionText)
        }
      }, 800)
      return () => clearTimeout(timeoutId)
    }
  }, [currentQuestion, autoSpeech])

  const handleNext = useCallback(() => {
    // Save current answer
    const currentAnswer = speechRecognition.transcript.trim()
    const updatedResponses = { ...testResponses }
    if (!updatedResponses.ielts_speaking_part_one) {
      updatedResponses.ielts_speaking_part_one = []
    }

    updatedResponses.ielts_speaking_part_one[currentQuestion] = {
      question_number: String(currentQuestion + 1).padStart(2, "0"),
      question: testData.part1.questions[currentQuestion],
      answer: currentAnswer || "",
    }

    setTestResponses(updatedResponses)
    speechRecognition.resetTranscript()

    if (currentQuestion < testData.part1.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setIsRecording(false)
    } else {
      onComplete()
    }
  }, [currentQuestion, onComplete, speechRecognition.transcript, testResponses, setTestResponses])

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setIsRecording(false)
      speechRecognition.resetTranscript()
    }
  }

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      speechRecognition.startListening()
      if (!timerActive) {
        setTimerActive(true)
      }
    } else {
      setIsRecording(false)
      speechRecognition.stopListening()
    }
  }

  const handleTimeUp = useCallback(() => {
    setTimerActive(false)
    setIsRecording(false)
    speechRecognition.stopListening()
    onComplete()
  }, [onComplete])

  const handleReset = () => {
    setIsRecording(false)
    speechRecognition.stopListening()
    speechRecognition.resetTranscript()
  }

  const handleSpeakQuestion = () => {
    const questionText = testData.part1.questions[currentQuestion]
    textToSpeech.speak(questionText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border border-blue-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white">
                <RiUser3Line className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{testData.part1.title}</h2>
                <p className="text-blue-600 font-medium text-sm sm:text-base">Personal Questions & Introduction</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Timer seconds={testData.part1.duration - timeSpent} isActive={timerActive} onTimeUp={handleTimeUp} />
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeech}
                onChange={(e) => setAutoSpeech(e.target.checked)}
                className="rounded"
              />
              <RiVolumeUpLine className="w-4 h-4" />
              Auto-speak questions
            </label>
            <button
              onClick={() => setShowAudioSettings(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              <RiVolumeUpLine className="w-4 h-4" />
              Audio Settings
            </button>
          </div>

          {/* Progress Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <RiQuestionLine className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Question {currentQuestion + 1} of {testData.part1.questions.length}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {Math.round(((currentQuestion + 1) / testData.part1.questions.length) * 100)}% Complete
              </span>
            </div>
            <ProgressBar current={currentQuestion + 1} total={testData.part1.questions.length} color="blue" />
          </div>

          {/* Question Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-8 rounded-xl mb-6 sm:mb-8 border-l-4 border-blue-500 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4">

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                 <div className="flex gap-2 items-start">
                   <div className="p-2 bg-blue-500 rounded-full text-white flex-shrink-0">
                    <RiSpeakLine className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 sm:block hidden">
                    {testData.part1.questions[currentQuestion]}
                  </h3>
                 </div>
                  {/* speak button  */}
                  <button
                    onClick={handleSpeakQuestion}
                    disabled={textToSpeech.isSpeaking}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {textToSpeech.isSpeaking ? (
                      <>
                        <RiVolumeMuteLine className="w-4 h-4" />
                        Speaking...
                      </>
                    ) : (
                      <>
                        <RiVolumeUpLine className="w-4 h-4" />
                        Speak
                      </>
                    )}
                  </button>
                </div>
                 <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 sm:hidden block mt-2">
                    {testData.part1.questions[currentQuestion]}</h3>
                <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                  <RiLightbulbLine className="w-4 h-4" />
                  Take your time to answer this question. Speak naturally and provide details.
                </p>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <RecordingControls
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onReset={handleReset}
              transcript={speechRecognition.transcript}
              isListening={speechRecognition.isListening}
            />
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-50 text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-red-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                <RiMicLine className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Recording in progress...</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
              <RiArrowLeftLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200 font-medium text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
            >
              {currentQuestion === testData.part1.questions.length - 1 ? (
                <>
                  Complete Part 1
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              ) : (
                <>
                  Next Question
                  <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings Modal */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
        textToSpeech={textToSpeech}
      />
    </div>
  )
}

const Part2Component = ({ onComplete, testResponses, setTestResponses }) => {
  const [phase, setPhase] = useState("preparation")
  const [isRecording, setIsRecording] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [autoSpeech, setAutoSpeech] = useState(true)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [showNotepad, setShowNotepad] = useState(false)
  const [notes, setNotes] = useState("")
  const textToSpeech = useTextToSpeech()
  const speechRecognition = useSpeechRecognition()

  const currentDuration = phase === "preparation" ? testData.part2.prepTime : testData.part2.speakTime

  useEffect(() => {
    if (autoSpeech && textToSpeech.isSupported && !textToSpeech.isSpeaking) {
      const cueCardText = `${testData.part2.cueCard.topic}. You should say: ${testData.part2.cueCard.points.join(", ")}`
      const timeoutId = setTimeout(() => {
        if (autoSpeech && !textToSpeech.isSpeaking) {
          textToSpeech.speak(cueCardText)
        }
      }, 1200)
      return () => clearTimeout(timeoutId)
    }
  }, [autoSpeech])

  const handleStartPreparation = () => {
    setTimerActive(true)
  }

  const handleTimeUp = useCallback(() => {
    if (phase === "preparation") {
      setPhase("speaking")
      setTimerActive(false)
      if (autoSpeech && textToSpeech.isSupported) {
        const timeoutId = setTimeout(() => {
          if (!textToSpeech.isSpeaking) {
            textToSpeech.speak("Preparation time is over. Now you can start speaking about the topic.")
          }
        }, 800)
      }
    } else {
      // Save Part 2 response
      const updatedResponses = { ...testResponses }
      updatedResponses.ielts_speaking_part_two = {
        question: testData.part2.cueCard.topic,
        cue_card: ["You should say:", ...testData.part2.cueCard.points],
        answer: speechRecognition.transcript.trim() || "",
      }
      setTestResponses(updatedResponses)

      setTimerActive(false)
      setIsRecording(false)
      speechRecognition.stopListening()
      onComplete()
    }
  }, [phase, onComplete, autoSpeech, speechRecognition.transcript, testResponses, setTestResponses])

  const handleToggleRecording = () => {
    if (phase === "speaking") {
      if (!isRecording) {
        setIsRecording(true)
        speechRecognition.startListening()
        if (!timerActive) {
          setTimerActive(true)
        }
      } else {
        setIsRecording(false)
        speechRecognition.stopListening()
      }
    }
  }

  const handleReset = () => {
    setIsRecording(false)
    speechRecognition.stopListening()
    speechRecognition.resetTranscript()
  }

  const handleSpeakCueCard = () => {
    const cueCardText = `${testData.part2.cueCard.topic}. You should say: ${testData.part2.cueCard.points.join(", ")}`
    textToSpeech.speak(cueCardText)
  }

  const handleComplete = () => {
    // Save Part 2 response
    const updatedResponses = { ...testResponses }
    updatedResponses.ielts_speaking_part_two = {
      question: testData.part2.cueCard.topic,
      cue_card: ["You should say:", ...testData.part2.cueCard.points],
      answer: speechRecognition.transcript.trim() || "",
    }
    setTestResponses(updatedResponses)
    speechRecognition.stopListening()
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border border-yellow-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between justify-center items-start sm:items-center gap-4 mb-6 sm:mb-8 mx-auto">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white">
                <RiFileTextLine className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{testData.part2.title}</h2>
                <p className="text-orange-600 font-medium text-sm sm:text-base">Individual Long Turn</p>
              </div>
            </div>
            <Timer seconds={currentDuration} isActive={timerActive} onTimeUp={handleTimeUp} />
          </div>

          {/* Audio Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeech}
                onChange={(e) => setAutoSpeech(e.target.checked)}
                className="rounded"
              />
              <RiVolumeUpLine className="w-4 h-4" />
              Auto-speak instructions
            </label>
            <button
              onClick={() => setShowNotepad(!showNotepad)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
            >
              <RiEditLine className="w-4 h-4" />
              {showNotepad ? "Hide Notepad" : "Show Notepad"}
            </button>
            <button
              onClick={() => setShowAudioSettings(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
            >
              <RiVolumeUpLine className="w-4 h-4" />
              Audio Settings
            </button>
          </div>

          {/* Notepad */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden mb-6 ${showNotepad ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <RiEditLine className="w-5 h-5 text-yellow-600" />
                <h4 className="text-lg font-semibold text-yellow-800">Notes</h4>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ outline: "none" }}
                placeholder="Write your notes here to prepare for your answer..."
                className="w-full h-32 p-3 border border-yellow-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-4 bg-gray-100 p-2 rounded-full w-full sm:w-auto">
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 text-sm sm:text-base ${phase === "preparation" ? "bg-blue-500 text-white shadow-lg" : "text-gray-500"
                  }`}
              >
                <RiBookOpenLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Preparation</span>
              </div>
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 text-sm sm:text-base ${phase === "speaking" ? "bg-green-500 text-white shadow-lg" : "text-gray-500"
                  }`}
              >
                <RiMicLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Speaking</span>
              </div>
            </div>
          </div>

          {/* Cue Card */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 sm:p-8 rounded-xl mb-6 sm:mb-8 shadow-lg">
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 bg-yellow-500 rounded-full text-white">
                  <RiFlag2Line className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 sm:block hidden">{testData.part2.cueCard.topic}</h3>
              </div>
              <button
                onClick={handleSpeakCueCard}
                disabled={textToSpeech.isSpeaking}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors text-sm disabled:opacity-50 flex-shrink-0"
              >
                {textToSpeech.isSpeaking ? (
                  <>
                    <RiVolumeMuteLine className="w-4 h-4" />
                    Speaking...
                  </>
                ) : (
                  <>
                    <RiVolumeUpLine className="w-4 h-4" />
                    Speak
                  </>
                )}
              </button>
            </div>
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 block sm:hidden mb-2">{testData.part2.cueCard.topic}</h3>
            <div className="ml-0 sm:ml-12">
              <p className="text-gray-700 mb-3 sm:mb-4 font-semibold flex items-center gap-2 text-sm sm:text-base">
                <RiVolumeUpLine className="w-4 h-4" />
                You should say:
              </p>
              <ul className="space-y-2 sm:space-y-3">
                {testData.part2.cueCard.points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Phase Content */}
          {phase === "preparation" && (
            <div className="text-center">
              <div className="bg-blue-50 p-4 sm:p-8 rounded-xl mb-4 sm:mb-6 border border-blue-200">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <RiBookOpenLine className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Preparation Time</h4>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-lg">
                  You have 1 minute to prepare your answer. You can make notes if you wish.
                </p>
                {!timerActive && (
                  <button
                    onClick={handleStartPreparation}
                    className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200 font-semibold text-sm sm:text-lg mx-auto"
                  >
                    <RiPlayLine className="w-5 h-5 sm:w-6 sm:h-6" />
                    Start Preparation
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === "speaking" && (
            <div className="text-center">
              <div className="bg-green-50 p-4 sm:p-8 rounded-xl mb-4 sm:mb-6 border border-green-200">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <RiMicLine className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Speaking Time</h4>
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-lg">
                  Now speak for 1-2 minutes about the topic. The examiner will stop you after 2 minutes.
                </p>
                <RecordingControls
                  isRecording={isRecording}
                  onToggleRecording={handleToggleRecording}
                  onReset={handleReset}
                  transcript={speechRecognition.transcript}
                  isListening={speechRecognition.isListening}
                />
              </div>
              {isRecording && (
                <div className="mb-4 sm:mb-6">
                  <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-50 text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-red-200">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <RiMicLine className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-sm sm:text-base">Recording in progress...</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-200 font-semibold text-sm sm:text-lg mx-auto"
              >
                Complete Part 2
                <RiCheckboxCircleLine className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Audio Settings Modal */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
        textToSpeech={textToSpeech}
      />
    </div>
  )
}

const Part3Component = ({ onComplete, testResponses, setTestResponses }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [autoSpeech, setAutoSpeech] = useState(true)
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const textToSpeech = useTextToSpeech()
  const speechRecognition = useSpeechRecognition()

  // Auto-speak question when it changes
  useEffect(() => {
    if (autoSpeech && textToSpeech.isSupported && !textToSpeech.isSpeaking) {
      const questionText = testData.part3.questions[currentQuestion]
      const timeoutId = setTimeout(() => {
        if (autoSpeech && !textToSpeech.isSpeaking) {
          textToSpeech.speak(questionText)
        }
      }, 800)
      return () => clearTimeout(timeoutId)
    }
  }, [currentQuestion, autoSpeech])

  const handleNext = useCallback(() => {
    // Save current answer
    const currentAnswer = speechRecognition.transcript.trim()
    const updatedResponses = { ...testResponses }
    if (!updatedResponses.ielts_speaking_part_three) {
      updatedResponses.ielts_speaking_part_three = []
    }

    updatedResponses.ielts_speaking_part_three[currentQuestion] = {
      question_number: String(currentQuestion + 1).padStart(2, "0"),
      question: testData.part3.questions[currentQuestion],
      answer: currentAnswer || "",
    }

    setTestResponses(updatedResponses)
    speechRecognition.resetTranscript()

    if (currentQuestion < testData.part3.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setIsRecording(false)
    } else {
      onComplete()
    }
  }, [currentQuestion, onComplete, speechRecognition.transcript, testResponses, setTestResponses])

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setIsRecording(false)
      speechRecognition.resetTranscript()
    }
  }

  const handleToggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true)
      speechRecognition.startListening()
      if (!timerActive) {
        setTimerActive(true)
      }
    } else {
      setIsRecording(false)
      speechRecognition.stopListening()
    }
  }

  const handleTimeUp = useCallback(() => {
    setTimerActive(false)
    setIsRecording(false)
    speechRecognition.stopListening()
    onComplete()
  }, [onComplete])

  const handleReset = () => {
    setIsRecording(false)
    speechRecognition.stopListening()
    speechRecognition.resetTranscript()
  }

  const handleSpeakQuestion = () => {
    const questionText = testData.part3.questions[currentQuestion]
    textToSpeech.speak(questionText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border border-purple-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white">
                <RiChatVoiceLine className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">{testData.part3.title}</h2>
                <p className="text-purple-600 font-medium text-sm sm:text-base">Two-way Discussion</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Timer seconds={testData.part3.duration} isActive={timerActive} onTimeUp={handleTimeUp} />
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-sm sm:text-base text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeech}
                onChange={(e) => setAutoSpeech(e.target.checked)}
                className="rounded"
              />
              <RiVolumeUpLine className="w-4 h-4" />
              Auto-speak questions
            </label>
            <button
              onClick={() => setShowAudioSettings(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            >
              <RiVolumeUpLine className="w-4 h-4" />
              Audio Settings
            </button>
          </div>

          {/* Progress Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <RiQuestionLine className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Question {currentQuestion + 1} of {testData.part3.questions.length}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                {Math.round(((currentQuestion + 1) / testData.part3.questions.length) * 100)}% Complete
              </span>
            </div>
            <ProgressBar current={currentQuestion + 1} total={testData.part3.questions.length} color="purple" />
          </div>

          {/* Question Card */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 sm:p-8 rounded-xl mb-6 sm:mb-8 border-l-4 border-purple-500 shadow-lg">
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                 <div className="flex gap-2 items-start">
                   <div className="p-2 bg-purple-500 rounded-full text-white flex-shrink-0">
                    <RiGlobalLine className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 sm:block hidden">
                    {testData.part3.questions[currentQuestion]}
                  </h3>
                 </div>
                  {/* speak button  */}
                  <button
                    onClick={handleSpeakQuestion}
                    disabled={textToSpeech.isSpeaking}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors text-sm disabled:opacity-50"
                  >
                    {textToSpeech.isSpeaking ? (
                      <>
                        <RiVolumeMuteLine className="w-4 h-4" />
                        Speaking...
                      </>
                    ) : (
                      <>
                        <RiVolumeUpLine className="w-4 h-4" />
                        Speak
                      </>
                    )}
                  </button>
                </div>
                 <h3 className="text-lg sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3 sm:hidden block mt-2">
                    {testData.part3.questions[currentQuestion]}</h3>
                <p className="text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                  <RiLightbulbLine className="w-4 h-4" />
                  Take your time to answer this question. Speak naturally and provide details.
                </p>
              </div>


            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <RecordingControls
              isRecording={isRecording}
              onToggleRecording={handleToggleRecording}
              onReset={handleReset}
              transcript={speechRecognition.transcript}
              isListening={speechRecognition.isListening}
            />
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-red-50 text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-red-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                <RiMicLine className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold text-sm sm:text-base">Recording in progress...</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
              <RiArrowLeftLine className="w-4 h-4 sm:w-5 sm:h-5" />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-200 font-medium text-sm sm:text-base w-full sm:w-auto order-1 sm:order-2"
            >
              {currentQuestion === testData.part3.questions.length - 1 ? (
                <>
                  Complete Test
                  <RiTrophyLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              ) : (
                <>
                  Next Question
                  <RiArrowRightLine className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Settings Modal */}
      <AudioSettings
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
        textToSpeech={textToSpeech}
      />
    </div>
  )
}

const ResultsComponent = ({ onRestart, testResponses }) => {
  // Console log the complete test data when results are shown
  useEffect(() => {
    console.log("=== IELTS SPEAKING MOCK TEST RESULTS ===")
    console.log(JSON.stringify([testResponses], null, 2))
  }, [testResponses])

  const evaluation = {
    overallBand: 6.5,
    criteria: {
      fluencyCoherence: 6.0,
      lexicalResource: 7.0,
      grammaticalRange: 6.5,
      pronunciation: 6.5,
    },
    feedback: {
      strengths: [
        "Good vocabulary range with some less common words",
        "Generally clear pronunciation",
        "Able to discuss abstract topics",
        "Good use of linking words",
      ],
      improvements: [
        "Work on reducing hesitation and pauses",
        "Practice more complex grammatical structures",
        "Improve word stress and intonation",
        "Develop ideas more fully with specific examples",
      ],
    },
    bandDescriptions: {
      6.0: "Competent User - Generally effective command of the language despite some inaccuracies",
      6.5: "Good User - Generally good command with some inaccuracies and inappropriate usage",
      7.0: "Good User - Good operational command, occasional inaccuracies and misunderstandings",
    },
  }

  const getBandColor = (band) => {
    if (band >= 7.0) return "text-green-600"
    if (band >= 6.0) return "text-yellow-600"
    return "text-red-600"
  }

  const getBandBgColor = (band) => {
    if (band >= 7.0) return "bg-gradient-to-r from-green-100 to-green-200"
    if (band >= 6.0) return "bg-gradient-to-r from-yellow-100 to-yellow-200"
    return "bg-gradient-to-r from-red-100 to-red-200"
  }

  const criteriaIcons = {
    fluencyCoherence: RiSpeakLine,
    lexicalResource: RiBookOpenLine,
    grammaticalRange: RiFileTextLine,
    pronunciation: RiVolumeUpLine,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 border border-green-100">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white mb-4 sm:mb-6 shadow-lg">
              <RiTrophyLine className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">Test Completed!</h2>
            <p className="text-lg sm:text-xl text-gray-600">Here's your detailed evaluation and feedback</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                ✅ All responses have been collected and logged to console
              </p>
            </div>
          </div>

          {/* Overall Band Score */}
          <div
            className={`${getBandBgColor(evaluation.overallBand)} p-6 sm:p-8 rounded-2xl mb-8 sm:mb-10 text-center shadow-lg border`}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <RiBarChartLine className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Overall Band Score</h3>
            </div>
            <div className={`text-5xl sm:text-7xl font-bold ${getBandColor(evaluation.overallBand)} mb-3 sm:mb-4`}>
              {evaluation.overallBand}
            </div>
            <p className="text-gray-700 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              {evaluation.bandDescriptions[Math.floor(evaluation.overallBand)]}
            </p>
          </div>

          {/* Individual Criteria */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg border">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <RiStarLine className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Individual Scores</h4>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(evaluation.criteria).map(([criteria, score]) => {
                  const IconComponent = criteriaIcons[criteria]
                  return (
                    <div
                      key={criteria}
                      className="flex justify-between items-center p-3 sm:p-4 bg-white rounded-xl shadow-sm"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        <span className="text-gray-700 font-medium capitalize text-sm sm:text-base">
                          {criteria.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                      <span className={`font-bold text-lg sm:text-xl ${getBandColor(score)}`}>{score}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg border">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <RiHeadphoneLine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Test Summary</h4>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-xl">
                  <RiUser3Line className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Part 1: Introduction & Interview</p>
                    <p className="text-xs sm:text-sm text-gray-600">Personal questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl">
                  <RiFileTextLine className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Part 2: Individual Long Turn</p>
                    <p className="text-xs sm:text-sm text-gray-600">Cue card topic</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-xl">
                  <RiChatVoiceLine className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Part 3: Two-way Discussion</p>
                    <p className="text-xs sm:text-sm text-gray-600">Abstract discussion</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-xl">
                  <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">Total Duration: ~15 minutes</p>
                    <p className="text-xs sm:text-sm text-gray-600">Complete IELTS Speaking test</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 sm:p-8 rounded-2xl shadow-lg border border-green-200">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <RiThumbUpLine className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                <h4 className="text-xl sm:text-2xl font-bold text-green-800">Strengths</h4>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {evaluation.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3 text-green-700">
                    <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <RiFlag2Line className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h4 className="text-xl sm:text-2xl font-bold text-blue-800">Areas for Improvement</h4>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {evaluation.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3 text-blue-700">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 rounded-full mt-0.5 flex-shrink-0"></div>
                    <span className="font-medium text-sm sm:text-base">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg sm:text-xl font-bold rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200 mx-auto"
            >
              <RiRefreshLine className="w-5 h-5 sm:w-6 sm:h-6" />
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-indigo-100">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white mb-4 sm:mb-6 shadow-lg">
              <RiHeadphoneLine className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">IELTS Speaking Mock Test</h1>
            <p className="text-lg sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Practice your IELTS Speaking skills with real speech-to-text technology and comprehensive feedback
            </p>
          </div>

          {/* Test Parts Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 rounded-full text-white">
                  <RiUser3Line className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-800">Part 1</h3>
              </div>
              <p className="text-blue-700 text-base sm:text-lg font-semibold mb-2">Introduction & Interview</p>
              <p className="text-blue-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Personal questions about yourself, your family, work, studies, and interests
              </p>
              <div className="flex items-center gap-2 text-blue-600">
                <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">4-5 minutes</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 sm:p-8 rounded-2xl shadow-lg border border-yellow-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-yellow-500 rounded-full text-white">
                  <RiFileTextLine className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-yellow-800">Part 2</h3>
              </div>
              <p className="text-yellow-700 text-base sm:text-lg font-semibold mb-2">Individual Long Turn</p>
              <p className="text-yellow-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Speak about a specific topic using a cue card with prompts
              </p>
              <div className="flex items-center gap-2 text-yellow-600">
                <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">3-4 minutes</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl shadow-lg border border-purple-200 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500 rounded-full text-white">
                  <RiChatVoiceLine className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-purple-800">Part 3</h3>
              </div>
              <p className="text-purple-700 text-base sm:text-lg font-semibold mb-2">Two-way Discussion</p>
              <p className="text-purple-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Abstract discussion related to the Part 2 topic
              </p>
              <div className="flex items-center gap-2 text-purple-600">
                <RiTimeLine className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">4-5 minutes</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 sm:p-8 rounded-2xl mb-8 sm:mb-12 shadow-lg border">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <RiLightbulbLine className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              <h4 className="text-xl sm:text-2xl font-bold text-gray-800">Advanced Features</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiVolumeUpLine className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Real speech-to-text recognition</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiMicLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Live transcript display</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiTimeLine className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Automatic timing with visual indicators</span>
                </li>
              </ul>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiVolumeDownLine className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Adjustable voice settings</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiBarChartLine className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Complete response data collection</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-gray-700">
                  <RiHeadphoneLine className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Cross-platform compatibility</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl mb-8 sm:mb-12 shadow-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <RiCheckboxCircleLine className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h4 className="text-xl sm:text-2xl font-bold text-blue-800">Instructions</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Ensure you're in a quiet environment</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Allow microphone access when prompted</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Speak clearly and at a natural pace</span>
                </li>
              </ul>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Use headphones for better audio quality</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Your responses will be collected for analysis</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3 text-blue-700">
                  <RiCheckboxCircleLine className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base">Take your time and stay relaxed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={onStart}
              className="flex items-center gap-3 sm:gap-4 px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg sm:text-2xl font-bold rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-green-200 mx-auto"
            >
              <RiPlayLine className="w-6 h-6 sm:w-8 sm:h-8" />
              Start Mock Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function App() {
  const [currentPart, setCurrentPart] = useState("welcome")
  const [testResponses, setTestResponses] = useState({})

  const handleStartTest = () => {
    setCurrentPart("part1")
    setTestResponses({}) // Reset responses
  }

  const handlePart1Complete = () => {
    setCurrentPart("part2")
  }

  const handlePart2Complete = () => {
    setCurrentPart("part3")
  }

  const handlePart3Complete = () => {
    setCurrentPart("results")
  }

  const handleRestart = () => {
    setCurrentPart("welcome")
    setTestResponses({})
  }

  return (
    <div className="min-h-screen">
      {currentPart === "welcome" && <WelcomeScreen onStart={handleStartTest} />}
      {currentPart === "part1" && (
        <Part1Component
          onComplete={handlePart1Complete}
          testResponses={testResponses}
          setTestResponses={setTestResponses}
        />
      )}
      {currentPart === "part2" && (
        <Part2Component
          onComplete={handlePart2Complete}
          testResponses={testResponses}
          setTestResponses={setTestResponses}
        />
      )}
      {currentPart === "part3" && (
        <Part3Component
          onComplete={handlePart3Complete}
          testResponses={testResponses}
          setTestResponses={setTestResponses}
        />
      )}
      {currentPart === "results" && <ResultsComponent onRestart={handleRestart} testResponses={testResponses} />}
    </div>
  )
}
