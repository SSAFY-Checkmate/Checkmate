import { useState } from "react";

const App = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 space-y-4">
      <h1 className="text-2xl font-bold text-primary">Ad Check</h1>
      <p className="text-sm text-slate-500">Extension Skeleton Set Up</p>

      <button
        type="button"
        className="px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        onClick={() => setCount((prev) => prev + 1)}
      >
        Count is {count}
      </button>
    </div>
  );
};

export default App;
