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

                    <div className="border-t border-white/10 pt-6">
                        <p className="text-sm text-gray-400 mb-4">Need help? Contact Support:</p>
                        <div className="flex flex-col gap-3">
                            <a href="mailto:support@nexusschool.com" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/20">
                                <Mail size={16} className="text-blue-400" />
                                <span className="text-sm">support@nexusschool.com</span>
                            </a>
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/5">
                                <MessageCircle size={16} className="text-green-400" />
                                <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
