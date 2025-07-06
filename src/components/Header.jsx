import { FaMicrophone, FaHome } from "react-icons/fa"
import { Link } from "react-router"

const Header = () => {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FaMicrophone className="text-2xl" />
            <h1 className="text-2xl font-bold">IELTS Speaking Mock Test</h1>
          </Link>
          <nav>
            <Link to="/" className="flex items-center space-x-1 hover:text-blue-200">
              <FaHome />
              <span>Home</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
