import React from 'react';
import { SettingsIcon, GabuIcon, CameraIcon, ImageIcon, AudioIcon } from './Icons';

interface IdleScreenProps {
  onStartScan: () => void;
  onUploadImage: () => void;
  onUploadAudio: () => void;
  onOpenSettings: () => void;
}

// A realistic, heartwarming image of a young African boy, around 8 years old, sitting at a wooden desk in a cozy, sunlit room, focused on his homework.
const heroBackgroundImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoGBxMUExYUExQYFhYYGCcYGBgYGBsYGhoaGhkbGhsaGBkbHysiGhwoHhgfIzQjKCwuMTExGSE3PDcwOyswMS4BCwsLDw4PHRERHTAnIigwMDAwMDAwMDIyMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMP/AABEIARoAvgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAEUQAAIBAgMFAwgGBwUIAwAAAAECEQADBBIhBTFBUQYTImFxgZEyobHwFEJScsHR4RYjM4KS8RYkQ1Njc6KywhclY4T/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAiEQEBAAIBBAMBAQEAAAAAAAAAAQIRAxIhMQRBE1EiMmH/2gAMAwEAAhEDEQA/APcUpClpQKBS0tIBaUpQAtKUoAKUpQAtKUoAWlKUoAWlKUoAWlKUoAKUpQAtKUoAWlKUAFLS0tMBaUpQAtKUoAWlKUAKKVKKBilpKVQxSlKAClKUAFLS0tABRRRQAtKUoAKUpQAtKUoAKUpQAUUUUALSlKAClKUAFLS0tMBaUpQAUtJSigYooooAKKKKACiiigAoopaBiilooAKKKKBiilooAKKKKACilooAKKKKACilooAKKKKACiiigApaWlpgLS0lLSAKKKKACiiigApaSlFABS0lKAClpKWgApaKWgYopaWgYopaKACiiigYopaSgApaKWgApaSloAKKKKACiiigApaWlpgLSUlLSAKKKKACilpKACiiloGKKKKACiiigAooooAKKKKACiiigAooooGKKKKBiilpKACiiigAooooAKKKKACloooAWiiimAtJS0tIBaSlFABRRRQAUUUUAFFFFABRRRQAUUUUALRRRQAUUUUAFLRRQAUUUUAFLRRQAUUUUAFLRRQAUUUtAC0UUUwFooooAKKKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWigBaKKKYC0UUUAFLRRQAUUUUAFLSUUAFLSUUALSUUtABS0lLQAUUUUAFFFFABSUtFABRRRQAUUUUAFLSUUALSUUUAFLRRQAtFFFMBeiikoGKWkooAKKKKACiikoAWiiigApaSigYpaSigApaSigYpaSigApaSloGKWkooAKKKWgYopaSgApaSigAooooAKKKKYC0lFFAxS0lLQMUtJS0DFLSUUALSUUtAxaSiloGKKWkoAKKKWgYopaSgAopaSgYpaSloAWkoooGKKWkoAWkoooAKKKKACiiimAtJSUtAxaSiloGKWkooAKSlFABRRRQAtJS0UAFLSUUAFLSUUAFFFFABSUtFABRRRQAUUUUAFFFFABSUtFAxRRRTAWkoooGKKKKBiilooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKYC0lLSUDFpKWloGKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWiiimAtJS0lAxRRRQAUlLSUDFpKWigAooooGKWkpaACkpaKACkpaSgYooooAKKKWgYopaSgAooooAKKKKBiilpKBilpKKACiiimAtJSUtAxS0lFAxS0lLQAtJS0UDFLSUUAFLSUtAxaKKKACiiigApaSigYtJS0lAxaKKKACiiloAKWkooAKKKKACiiigAooooAKKKKYC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//Z';

const IdleScreen: React.FC<IdleScreenProps> = ({ onStartScan, onUploadImage, onUploadAudio, onOpenSettings }) => {
  return (
    <div 
      className="relative w-full h-full bg-cover bg-center rounded-3xl"
      style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      role="main"
      aria-labelledby="hero-heading"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/60 rounded-3xl" />
      
      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-8 h-full overflow-y-auto text-center">
        <button onClick={onOpenSettings} className="absolute top-4 right-4 text-gray-600 hover:text-purple-700 transition-colors" aria-label="Settings">
            <SettingsIcon className="w-8 h-8"/>
        </button>
        
        <div className="max-w-3xl">
            <GabuIcon className="w-24 h-24 text-purple-500 mb-4 mx-auto animate-gentle-bounce" />
            <h1 id="hero-heading" className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-800">Making homework easy, step-by-step.</h1>
            <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
                I'm Gabu! I'll be your friendly guide for any subject. Just show me what you're working on, and I'll explain it in a simple way.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
                <div className="flex flex-col items-center">
                <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">1</div>
                <button
                    onClick={onStartScan}
                    className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-orange-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <CameraIcon className="w-8 h-8"/>
                    <span>Scan with Camera</span>
                </button>
                </div>
                <div className="flex flex-col items-center">
                <div className="bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">2</div>
                <button
                    onClick={onUploadImage}
                    className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-teal-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <ImageIcon className="w-8 h-8"/>
                    <span>Upload an Image</span>
                </button>
                </div>
                <div className="flex flex-col items-center">
                <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">3</div>
                <button
                    onClick={onUploadAudio}
                    className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                    <AudioIcon className="w-8 h-8"/>
                    <span>Upload Audio</span>
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default IdleScreen;
