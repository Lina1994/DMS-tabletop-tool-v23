import React, { createContext, useState, useContext, useCallback } from 'react';
import API_BASE_URL from '../apiConfig';

const CampaignContext = createContext();

export const useCampaign = () => useContext(CampaignContext);

export const CampaignProvider = ({ children }) => {
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [combatTokens, setCombatTokens] = useState([]); // State for combat tokens

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  }, []);

  const value = {
    currentCampaign,
    setCurrentCampaign,
    campaigns,
    fetchCampaigns,
    combatTokens, 
    setCombatTokens,
  };

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
};
