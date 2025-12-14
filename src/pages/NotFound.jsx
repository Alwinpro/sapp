import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-slate-700">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/10 p-4 rounded-full">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    404
                </h1>

                <h2 className="text-2xl font-semibold mb-4 text-slate-200">Page Not Found</h2>

                <p className="text-slate-400 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-blue-600/20 group"
                >
                    <Home className="w-5 h-5" />
                    <span>Back to Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
