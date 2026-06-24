import React, { useState, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';

const SpotCharacter = () => {
  const [hasArrived, setHasArrived] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Searching for location...");

  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "/unity-v3/UnityExport.loader.js",
    dataUrl: "/unity-v3/UnityExport.data",
    frameworkUrl: "/unity-v3/UnityExport.framework.js",
    codeUrl: "/unity-v3/UnityExport.wasm",
  });

  const loadingPercentage = Math.round(loadingProgression * 100);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 p-4 pt-10">
      <h1 className="text-3xl font-bold mb-2 text-orange-600">AR Spot Guide</h1>

      {!hasArrived ? (
        <div className="flex flex-col items-center justify-center p-8 mt-10 bg-white rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2">Welcome to the Tour</h2>
          <button
            onClick={() => setHasArrived(true)}
            className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg"
          >
            Summon Jinmin
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl flex flex-col items-center">
          <div className="relative w-full aspect-[9/16] rounded-xl shadow-2xl overflow-hidden border-4 border-orange-400 bg-black">
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                <p className="text-xl">Summoning Jinmin... {loadingPercentage}%</p>
              </div>
            )}
            <Unity unityProvider={unityProvider} className="w-full h-full object-cover" />
          </div>
          
          <button
            onClick={() => setHasArrived(false)}
            className="mt-6 text-sm text-gray-500 underline"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotCharacter;