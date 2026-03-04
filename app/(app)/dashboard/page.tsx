import React from 'react'
import GitConnect from './components/GitConnect'

export default function DashboardPage() {
    return (
        <div className="w-full h-screen flex flex-col">

            {/* Top Bar */}
            <div className="h-12 border-b border-black flex items-center px-4">
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:flex-row">

                {/* Sidebar */}
                <div className="w-full md:w-[30%] lg:w-[40%] border-b md:border-b-0 md:border-r border-black">
                </div>

                {/* Main Panel */}
                <div className="w-full md:w-[70%] lg:w-[60%] p-2">
                    <GitConnect />
                </div>

            </div>
        </div>
    )
}