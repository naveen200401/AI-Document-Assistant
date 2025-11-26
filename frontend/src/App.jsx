import React from "react";
import RefinementEditor from "./components/RefinementEditor";

export default function App() {
  // For demo, we assume documentId=1 exists in DB
  return (
    <div className="min-h-screen bg-gray-100">
      <RefinementEditor documentId={1} />
    </div>
  );
}
