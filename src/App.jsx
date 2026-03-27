import { Routes, Route, Link } from "react-router-dom"
import { Login } from "./pages/Login/Login"
import { Signup } from "./pages/Signup/Signup"
import { Dashboard } from "./pages/Dashboard/Dashboard"
import { ExpensesPage } from "./pages/ExpensesPage/ExpensesPage"
import { Profile } from "./pages/Profile/Profile"
import { Analytics } from "./pages/Analytics/Analytics"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { PublicRoute } from "./components/PublicRoute"

function App() {
  return (
    <Routes>
      <Route path="/"
             element={
               <PublicRoute>
                 <Login />
               </PublicRoute>
              }
      />
      <Route path="/signup"
             element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
              }
      />
      <Route path="/dashboard"
             element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
              }
      />
      <Route path="/profile"
             element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
             }
      />
      <Route path="/expenses"
             element={
               <ProtectedRoute>
                 <ExpensesPage />
               </ProtectedRoute>
              }
      />
      <Route path="/analytics"
             element={
               <ProtectedRoute>
                 <Analytics />
               </ProtectedRoute>
              }
      />
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  )
}

export default App