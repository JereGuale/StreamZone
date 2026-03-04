import React, { useState } from 'react';
import { tv } from '../utils/helpers';

interface ConfirmActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDark: boolean;
    isDanger?: boolean;
    requireConfirmationText?: string;
}

export function ConfirmActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDark,
    isDanger = false,
    requireConfirmationText
}: ConfirmActionModalProps) {
    const [inputText, setInputText] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (requireConfirmationText && inputText !== requireConfirmationText) {
            alert(`Debe escribir exactamente: ${requireConfirmationText}`);
            return;
        }
        onConfirm();
        setInputText('');
        onClose();
    };

    const isConfirmDisabled = requireConfirmationText ? inputText !== requireConfirmationText : false;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className={`w-full max-w-md p-6 rounded-2xl shadow-xl border animate-in zoom-in-95 duration-200 ${tv(isDark, 'bg-white border-gray-200', 'bg-zinc-900 border-zinc-800')
                    }`}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {isDanger ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                    <h3 className={`text-lg font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                        {title}
                    </h3>
                </div>

                <p className={`mb-6 text-sm ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                    {message}
                </p>

                {requireConfirmationText && (
                    <div className="mb-6">
                        <label className={`block text-xs font-semibold mb-2 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                            Escribe "{requireConfirmationText}" para confirmar:
                        </label>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={requireConfirmationText}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${tv(isDark, 'bg-gray-50 border-gray-300', 'bg-zinc-800 border-zinc-700 text-white')
                                }`}
                        />
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                        onClick={() => { setInputText(''); onClose(); }}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tv(isDark, 'text-gray-700 bg-gray-100 hover:bg-gray-200', 'text-gray-300 bg-zinc-800 hover:bg-zinc-700')
                            }`}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDanger
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
