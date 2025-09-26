import React, { useState } from 'react';
import { useCampaign } from '../../contexts/CampaignContext';
import './AddWorldMapModal.css';
import API_BASE_URL from '../../apiConfig';

const AddWorldMapModal = ({ onClose }) => {
    const { currentCampaign } = useCampaign();
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            // Handle case where no image is selected
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = async () => {
            const base64data = reader.result;

            const worldMapData = {
                name,
                image_data: base64data,
                campaign_id: currentCampaign.id,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/worldmaps`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(worldMapData),
                });

                if (response.ok) {
                    onClose();
                } else {
                    console.error('Failed to add world map');
                }
            } catch (error) {
                console.error('Error adding world map:', error);
            }
        };
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add World Map</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>
                    <label>
                        Image:
                        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                    </label>
                    <button type="submit">Add</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default AddWorldMapModal;