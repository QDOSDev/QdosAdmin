import { Construction } from 'lucide-react'

export default function UnderConstruction() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4">
            <div className="text-center max-w-2xl mx-auto">
                <Construction className="w-24 h-24 text-blue-500 mx-auto mb-8 animate-bounce" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    We're Working on Something Awesome!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    This functionality is currently under construction. We're working hard to bring you an amazing experience. Please check back soon!
                </p>
                <div className="w-full max-w-md mx-auto bg-blue-500 h-4 rounded-full overflow-hidden">
                    <div className="bg-blue-300 h-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
            </div>
        </div>
    )
}

