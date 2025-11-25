import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Welcome } from "./pages/Welcome";
import { Editor } from "./components/Editor";
import "../public/styles/prosemirror.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
