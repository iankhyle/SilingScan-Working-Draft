import { BrowserRouter } from "react-router";
import { AppContent } from "./app/app-content";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
