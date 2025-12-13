import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Mail, MessageCircle } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
            <div className="glass-panel max-w-lg w-full p-8 rounded-2xl text-center border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-6">
                        <AlertCircle size={48} className="text-red-400" />
                    </div>

                    <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">404</h1>
                    <h2 className="text-2xl font-semibold mb-4 text-white">Page Not Found</h2>
                    <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                        Oops! The page you are looking for does not exist or has been moved.
                        It might be a broken link or a typo.
                    </p>

                    <div className="flex flex-col gap-3 mb-8">
                        <Link to="/" className="btn btn-primary flex items-center justify-center gap-2 py-3">
                            <Home size={18} />
                            Back to Home
                        </Link>
                    </div>

                    <div className="border-t border-white/10 pt-8 mt-2 flex flex-col items-center justify-center">
                        <div className="px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3 shadow-lg">
                            <MessageCircle size={18} className="text-blue-400" />
                            <span className="text-gray-300 font-medium tracking-wide">Need help? Contact IT Support</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
