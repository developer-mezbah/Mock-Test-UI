import { FaQuestionCircle, FaClock, FaLightbulb } from "react-icons/fa"

const QuestionDisplay = ({ part, question, questionNumber, totalQuestions, isPreparation }) => {
  const getPartTitle = () => {
    switch (part) {
      case 1:
        return "Introduction & Interview"
      case 2:
        return "Individual Long Turn (Cue Card)"
      case 3:
        return "Two-way Discussion"
      default:
        return "Speaking Test"
    }
  }

  const getPartInstructions = () => {
    switch (part) {
      case 1:
        return "Answer the questions about yourself and familiar topics. Speak naturally and give full answers."
      case 2:
        return "You have 1 minute to prepare. Then speak for 1-2 minutes on the topic. Use the bullet points to guide your talk."
      case 3:
        return "Discuss more abstract ideas related to the Part 2 topic. Give detailed answers with examples and explanations."
      default:
        return ""
    }
  }

  console.log(question?.text || question );
  
  return (
    <div className="space-y-4">
      <div className="border-l-4 border-blue-500 pl-4">
        <h3 className="text-xl font-semibold text-blue-600">{getPartTitle()}</h3>
        <p className="text-gray-600 text-sm">{getPartInstructions()}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FaQuestionCircle className="text-blue-500 mr-2" />
            <span className="font-medium">
              Question {questionNumber} of {totalQuestions}
            </span>
          </div>
          {isPreparation && (
            <div className="flex items-center text-orange-600">
              <FaClock className="mr-1" />
              <span className="text-sm">Preparation Time</span>
            </div>
          )}
        </div>

        <div className="text-lg leading-relaxed">
          {part === 2 ? (
            <div>
              <h4 className="font-semibold mb-3">{question?.topic}</h4>
              <p className="mb-3">{question?.description}</p>
              <div className="bg-white rounded p-3">
                <p className="font-medium mb-2">You should say:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {question?.points?.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>{question?.text || "" }</p>
            
          )}
        </div>

        {part === 2 && (
          <div className="mt-4 p-3 bg-blue-50 rounded flex items-start">
            <FaLightbulb className="text-yellow-500 mr-2 mt-1" />
            <div className="text-sm text-gray-700">
              <p className="font-medium">Tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Use the preparation time to make notes</li>
                <li>Speak for the full time allocated</li>
                <li>Address all bullet points</li>
                <li>Use linking words and varied vocabulary</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionDisplay
