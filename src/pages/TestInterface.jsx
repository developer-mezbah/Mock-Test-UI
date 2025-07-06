import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { FaForward } from "react-icons/fa"
import AudioRecorder from "../components/AudioRecorder"
import QuestionDisplay from "../components/QuestionDisplay"
import Timer from "../components/Timer"

const TestInterface = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [testId] = useState(location.state?.testId || null)
  const [currentPart, setCurrentPart] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [isPreparation, setIsPreparation] = useState(false)

  useEffect(() => {
    if (!testId) {
      navigate("/")
      return
    }
    loadQuestions()
  }, [testId, currentPart])

  const loadQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/questions/part${currentPart}`)
      const data = await response.json()
      setQuestions(data.questions || [])
      setCurrentQuestion(0)

      // Set timer based on part
      if (currentPart === 1) {
        setTimeLeft(300) // 5 minutes
      } else if (currentPart === 2) {
        setTimeLeft(60) // 1 minute preparation
        setIsPreparation(true)
      } else {
        setTimeLeft(300) // 5 minutes
      }
    } catch (error) {
      console.error("Error loading questions:", error)
    }
  }

  const handleRecordingComplete = (audioBlob) => {
    const newRecording = {
      part: currentPart,
      question: currentQuestion,
      audio: audioBlob,
      timestamp: new Date().toISOString(),
    }
    setRecordings((prev) => [...prev, newRecording])
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      nextPart()
    }
  }

  const nextPart = () => {
    if (currentPart < 3) {
      setCurrentPart((prev) => prev + 1)
    } else {
      finishTest()
    }
  }

  const finishTest = async () => {
    try {
      const formData = new FormData()
      formData.append("testId", testId)

      recordings.forEach((recording, index) => {
        formData.append(`recording_${index}`, recording.audio)
        formData.append(
          `metadata_${index}`,
          JSON.stringify({
            part: recording.part,
            question: recording.question,
            timestamp: recording.timestamp,
          }),
        )
      })

      const response = await fetch("http://localhost:3001/api/test/submit", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        navigate(`/results/${testId}`)
      }
    } catch (error) {
      console.error("Error submitting test:", error)
    }
  }

  if (!testId) {
    return <div>Loading...</div>
  }
  

  // console.log(currentPart, currentQuestion, questions, isPreparation);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Part {currentPart} of 3</h2>
            <Timer timeLeft={timeLeft} setTimeLeft={setTimeLeft} />
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentPart - 1) * 33.33 + ((currentQuestion + 1) / questions.length) * 33.33}%` }}
              ></div>
            </div>
          </div>

          {questions.length > 0 && (
            <QuestionDisplay
              part={currentPart}
              question={questions[currentQuestion] || ""}
              questionNumber={currentQuestion + 1}
              totalQuestions={questions.length || 0}
              isPreparation={isPreparation}
            />
          )}

          <div className="mt-8">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <button
              onClick={nextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
            >
              {currentPart === 3 && currentQuestion === questions.length - 1 ? "Finish Test" : "Next"}
              <FaForward className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestInterface
