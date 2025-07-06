import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { FaStar, FaCheckCircle, FaExclamationTriangle, FaDownload } from "react-icons/fa"

const Results = () => {
  const { testId } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResults()
  }, [testId])

  const fetchResults = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/test/results/${testId}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBandColor = (band) => {
    if (band >= 7) return "text-green-600"
    if (band >= 5.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getBandDescription = (band) => {
    if (band >= 8.5) return "Excellent"
    if (band >= 7.5) return "Very Good"
    if (band >= 6.5) return "Good"
    if (band >= 5.5) return "Modest"
    if (band >= 4.5) return "Limited"
    return "Extremely Limited"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>Results not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-3xl font-bold text-center mb-8">Your IELTS Speaking Results</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getBandColor(results.overallBand)}`}>
                {results.overallBand}
              </div>
              <div className="text-xl text-gray-600 mb-2">Overall Band Score</div>
              <div className={`text-lg font-semibold ${getBandColor(results.overallBand)}`}>
                {getBandDescription(results.overallBand)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Fluency & Coherence:</span>
                <span className={`font-bold ${getBandColor(results.criteria.fluency)}`}>
                  {results.criteria.fluency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Lexical Resource:</span>
                <span className={`font-bold ${getBandColor(results.criteria.vocabulary)}`}>
                  {results.criteria.vocabulary}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Grammatical Range:</span>
                <span className={`font-bold ${getBandColor(results.criteria.grammar)}`}>
                  {results.criteria.grammar}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Pronunciation:</span>
                <span className={`font-bold ${getBandColor(results.criteria.pronunciation)}`}>
                  {results.criteria.pronunciation}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaCheckCircle className="text-green-500 text-xl mr-2" />
              <h3 className="text-xl font-semibold">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {results.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-orange-500 text-xl mr-2" />
              <h3 className="text-xl font-semibold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-2">
              {results.feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Detailed Feedback</h3>
          <div className="space-y-4">
            {results.partFeedback.map((part, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">Part {part.part}</h4>
                <p className="text-gray-700">{part.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start">
                <FaStar className="text-yellow-500 mr-2 mt-1" />
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto">
            <FaDownload className="mr-2" />
            Download Detailed Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default Results
