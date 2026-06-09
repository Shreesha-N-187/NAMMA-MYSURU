import React from "react"

/*
UNITY 3D WEBGL SETUP — PRODUCTION BUILD GUIDE (M4 MACBOOK AIR OPTIMIZED):
1. Launch Unity Hub on your M4 Mac. Install Unity 6 LTS. Ensure the "WebGL Build Support" module is added.
2. Create a new 3D Core project named: "NammaMysuru-3D-Gamification"
3. Go to File → Build Settings, select "WebGL" and click "Switch Platform".
4. Open Project Settings → Player → WebGL Configuration:
   - Resolution and Presentation: Choose "Minimal" or "Blank" template.
   - Set Default Canvas Width to 384, Height to 384 (Matches our aspect ratio perfectly).
   - Under Publishing Settings: Set Compression Format to "Gzip" or "Brotli".
   - Set "Allow Fullscreen" to OFF to preserve mobile application context.
5. Setup the URL Parameters Interceptor C# Script:
   Create a script named "SpotLoader.cs" and attach it to your Main Scene Controller:
   
   using UnityEngine;
   
   public class SpotLoader : MonoBehaviour {
       public string targetSpot = "";
       
       void Start() {
           string absoluteUrl = Application.absoluteURL;
           if (absoluteUrl.Contains("?spot=")) {
               targetSpot = absoluteUrl.Split(new string[]{"?spot="}, System.StringSplitOptions.None)[1];
               if (targetSpot.Contains("&")) {
                   targetSpot = targetSpot.Split('&')[0];
               }
           }
           InstantiateCharacterPrefab(targetSpot);
       }
       
       void InstantiateCharacterPrefab(string id) {
           // Presentation Logic: Switch case to instantiate your low-poly 3D models
           // e.g., if (id == "hasiru-mane") ShowHasiruHouse();
       }
   }
6. 3D ASSETS OPTIMIZATION TARGETS FOR INTERFACE SMOOTHNESS:
   - Keep maximum polygon count under 1,500 triangles per character model.
   - Use a single texture sheet map per asset sized strictly to 512x512 pixels using Unlit shaders.
   - Build a looping animation clip (Idle) and an animation layer transition (Tapped via Raycasting).
7. Execute File → Build. Output directly to your static hosting endpoint directory.
8. Map the production link to the GAME_URL constant below.
*/

const GAME_URL = "https://game.web.app"

const CHARACTER_NAMES = {
  "hasiru-mane": "Hasiru the House",
  "loco-chocolates": "Cocoa the Wizard",
  "jin-min-cat": "Jin the Cat",
  "uchiha-cafe": "Kai the Ninja",
  "mr-co-cane": "Mr. Cane",
}

export default function SpotCharacter({ spotId }) {
  if (!spotId || !CHARACTER_NAMES[spotId]) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 animate-fade-in pointer-events-none">
      {/* Label Badge */}
      <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md transform translate-y-0 transition-transform duration-200">
        You found {CHARACTER_NAMES[spotId]}!
      </div>

      {/* 3D WebGL Web Canvas Frame Wrapper */}
      <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-blue-600 shadow-xl bg-white pointer-events-auto will-change-transform transform transition-transform duration-300 hover:scale-105 active:scale-95">
        <iframe
          src={`${GAME_URL}?spot=${spotId}`}
          title={CHARACTER_NAMES[spotId]}
          className="w-full h-full border-0 select-none unselectable"
          allow="accelerometer; gyroscope"
          scrolling="no"
        />
      </div>
    </div>
  )
}