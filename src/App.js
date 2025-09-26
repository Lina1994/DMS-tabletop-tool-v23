import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Maps from './components/Maps/Maps';
import Bestiary from './components/Bestiary/Bestiary';
import Database from './components/Database/Database';
import Shops from './components/Shops/Shops';
import Soundtrack from './components/Soundtrack/Soundtrack';
import Campaign from './components/Campaign/Campaign';
import PlayerView from './components/PlayerView/PlayerView';
import PanoramicView from './components/PlayerView/PanoramicView';
// Import new components
import Journal from './components/Journal/Journal';
import Encounters from './components/Encounters/Encounters';
import Combat from './components/Combat/Combat';
import Characters from './components/Characters/Characters';
import CampaignSelection from './components/CampaignSelection/CampaignSelection'; // Import the new component
import Spells from './components/Spells/Spells'; // Import the new Spells component
import WorldMap from './components/WorldMap/WorldMap';
import Missions from './components/Missions/Missions';
import Worldpedia from './components/Worldpedia/Worldpedia';

import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { DateProvider } from './contexts/DateContext'; // Import DateProvider
import { WorldpediaProvider } from './contexts/WorldpediaContext';
import { PanoramicViewProvider } from './contexts/PanoramicViewContext'; // Import PanoramicViewProvider
import './styles/main.css';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <Router>
      <AudioPlayerProvider>
        <SidebarProvider>
          <CampaignProvider>
            <DateProvider> 
              <WorldpediaProvider>
                <PanoramicViewProvider> {/* Wrap with PanoramicViewProvider */}
                  <Routes>
                    {/* Ruta para la vista del jugador (sin sidebar) */}
                    <Route path="/player-view" element={<PlayerView />} />
                    <Route path="/panoramic-view" element={<PanoramicView />} />

                    {/* Rutas para la vista del master (con sidebar) */}
                    <Route
                      path="/*"
                      element={
                        <div className="App">
                          <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                          <div className={`content ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                            <Routes>
                              <Route path="/" element={<CampaignSelection />} /> 
                              <Route path="/maps" element={<Maps />} />
                              <Route path="/bestiary" element={<Bestiary />} />
                              <Route path="/shops" element={<Shops />} />
                              <Route path="/soundtrack" element={<Soundtrack />} />
                              <Route path="/campaign" element={<Campaign />} />
                              <Route path="/characters" element={<Characters />} />
                              <Route path="/encounters" element={<Encounters />} />
                              <Route path="/combat" element={<Combat />} />
                              <Route path="/spells" element={<Spells />} />
                              <Route path="/worldmap" element={<WorldMap />} />
                              <Route path="/journal" element={<Journal />} />
                              <Route path="/missions" element={<Missions />} />
                              <Route path="/worldpedia" element={<Worldpedia />} />

                              {/* Nested routes for the Database section */}
                              <Route path="/database" element={<Database theme={theme} toggleTheme={toggleTheme} />}>
                                <Route path="maps" element={<Maps />} />
                                <Route path="worldmap" element={<WorldMap />} />
                                <Route path="bestiary" element={<Bestiary />} />
                                <Route path="shops" element={<Shops />} />
                                <Route path="soundtrack" element={<Soundtrack />} />
                                <Route path="campaign" element={<Campaign />} />
                                <Route path="journal" element={<Journal />} />
                                <Route path="encounters" element={<Encounters />} />
                                <Route path="combat" element={<Combat />} />
                                <Route path="characters" element={<Characters />} />
                                <Route path="spells" element={<Spells />} />
                                <Route path="missions" element={<Missions />} />
                                <Route path="worldpedia" element={<Worldpedia />} />
                                <Route index element={<h2>Select a section from the Database navigator above.</h2>} />
                              </Route>
                            </Routes>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </PanoramicViewProvider>
              </WorldpediaProvider>
            </DateProvider>
          </CampaignProvider>
        </SidebarProvider>
      </AudioPlayerProvider>
    </Router>
  );
}

export default App;