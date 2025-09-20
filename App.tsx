import React from 'react';
import CreativeCanvas from './components/CreativeCanvas';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 md:p-8">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-700/[0.05] [mask-image:linear-gradient(to_bottom,white_40%,transparent_100%)]"></div>
      <div className="relative max-w-7xl mx-auto">
        <header className="text-center my-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-500">
            Creative Canvas AI
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
            Bring your child's artwork to life. Upload a drawing, describe a magical change, and let our AI co-creator do the rest.
          </p>
        </header>

        <main>
          <CreativeCanvas />
        </main>

        <footer className="text-center mt-16 py-8 border-t border-slate-800">
            <p className="text-slate-500">Let's build the future of early childhood education. Together.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
