"use client";

import React from "react";
import Link from "next/link";
import { MdCancel } from "react-icons/md";

export default function Cancel() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
            <div className="bg-gray-50 p-10 rounded-2xl flex flex-col items-center text-center max-w-lg w-full shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600">
                    <MdCancel size={35} />
                </div>

                <h2 className="text-3xl font-bold text-black mb-2 uppercase tracking-tight">
                    Order Cancelled
                </h2>

                <p className="text-gray-500 mb-8">
                    Your payment was not processed.
                </p>

                <Link href="/e-com">
                    <button className="bg-black text-white px-8 py-3 font-bold uppercase text-sm tracking-widest hover:bg-gray-800 transition-colors w-full md:w-auto rounded-md">
                        Return to Shop
                    </button>
                </Link>
            </div>
        </div>
    );
}
