import { useState } from "react"
import { useNavigate } from "react-router"
import { FaPlay, FaInfoCircle, FaClock, FaMicrophone } from "react-icons/fa"

const Home = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const startTest = async () => {
    setIsLoading(true)
    // Initialize test session
    try {
      const response = await fetch("http://localhost:3001/api/test/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      if (data.success) {
        navigate("/test", { state: { testId: data.testId } })
      }
    } catch (error) {
      console.error("Error starting test:", error)
      alert("Failed to start test. Please try again.")
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">IELTS Speaking Practice Test</h2>
          <p className="text-xl text-gray-600 mb-8">
            Practice your IELTS speaking skills with our AI-powered mock test system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaInfoCircle className="text-blue-500 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Test Structure</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>
                <strong>Part 1:</strong> Introduction & Interview (4-5 minutes)
              </li>
              <li>
                <strong>Part 2:</strong> Individual Long Turn (3-4 minutes)
              </li>
              <li>
                <strong>Part 3:</strong> Two-way Discussion (4-5 minutes)
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaClock className="text-green-500 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Duration</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>
                <strong>Total Time:</strong> 11-14 minutes
              </li>
              <li>
                <strong>Preparation:</strong> 1 minute for Part 2
              </li>
              <li>
                <strong>Recording:</strong> All responses recorded
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaMicrophone className="text-6xl text-blue-500 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-4">Ready to Start?</h3>
          <p className="text-gray-600 mb-6">Make sure you have a working microphone and are in a quiet environment</p>
          <button
            onClick={startTest}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Starting Test...
              </span>
            ) : (
              <span className="flex items-center">
                <FaPlay className="mr-2" />
                Start Speaking Test
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
