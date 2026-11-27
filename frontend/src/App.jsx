import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./AddToCartSystem.jsx";
import Book from "./Book.jsx";
import OwnerPage from "./OwnerPage.jsx";
import LoginPage from "./Login.jsx";
import StaffPage from "./StaffPage.jsx";

function RequireRole({ allowed, children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token || !allowed.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Book />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/owner"
            element={
              <RequireRole allowed={["owner"]}>
                <OwnerPage />
              </RequireRole>
            }
          />

          <Route
            path="/staff"
            element={
              <RequireRole allowed={["staff", "owner"]}>
                <StaffPage />
              </RequireRole>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;