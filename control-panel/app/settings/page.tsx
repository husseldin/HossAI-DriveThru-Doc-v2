'use client'

import { AppLayout } from '@/components/AppLayout'
import { Mic, Volume2, Cpu, Zap, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppLayout
      title="System Settings"
      description="Configure AI models, voice settings, and system parameters"
    >
      <div className="space-y-6">
        {/* AI Models Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Cpu className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AI Models</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STT Model (Speech-to-Text)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Faster Whisper - Base (Current)</option>
                <option>Faster Whisper - Small</option>
                <option>Faster Whisper - Medium</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Current model: Faster Whisper with Metal acceleration
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TTS Model (Text-to-Speech)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Coqui XTTS v2 (Current)</option>
                <option>Bark Small</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Current model: Coqui XTTS v2 with multi-language support
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NLU Model (Natural Language Understanding)
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Llama 3.1 8B (Current)</option>
                <option>Gemma 2 9B</option>
                <option>Llama 3.1 14B</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Current model: Llama 3.1 8B with 4-bit quantization
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Model configuration changes require backend restart
                to take effect. Please update the .env file and restart the backend service.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Mic className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Voice Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option>Arabic (Default)</option>
                <option>English</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Code-Switching</p>
                <p className="text-sm text-gray-500">
                  Allow automatic detection of mixed Arabic/English speech
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Voice Interruption Detection</p>
                <p className="text-sm text-gray-500">
                  Detect when customer speaks during AI response
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Zap className="h-6 w-6 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STT Target Latency (ms)
              </label>
              <input
                type="number"
                defaultValue="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Target latency for speech-to-text processing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TTS Target Latency (ms)
              </label>
              <input
                type="number"
                defaultValue="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Target latency for text-to-speech generation
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable TTS Caching</p>
                <p className="text-sm text-gray-500">
                  Cache frequently used TTS responses for faster playback
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Enable Menu Caching</p>
                <p className="text-sm text-gray-500">
                  Cache menu data in Redis for faster access
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none"
                role="switch"
                aria-checked="true"
              >
                <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Backend Version</span>
              <span className="text-sm text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">Control Panel Version</span>
              <span className="text-sm text-gray-900">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-600">API Endpoint</span>
              <span className="text-sm text-gray-900">http://localhost:8000</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-900">2025-11-17</span>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Bell className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Configuration Note
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                The settings on this page are currently for display purposes only.
                To modify system configuration, please update the <code>.env</code> file
                in the backend directory and restart the backend service. Future updates
                will add the ability to modify these settings through the control panel
                with hot-reload support.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Reset to Defaults
          </button>
          <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
