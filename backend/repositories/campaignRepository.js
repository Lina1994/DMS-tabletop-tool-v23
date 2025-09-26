const db = require('../config/database');

function getCampaigns() {
    try {
        const stmt = db.prepare('SELECT * FROM campaigns');
        const data = stmt.all();
        const campaignsWithImageData = data.map(campaign => {
            const newCampaign = { ...campaign };
            if (newCampaign.image_data) {
                newCampaign.image_data = `data:image/png;base64,${newCampaign.image_data.toString('base64')}`;
            }
            return newCampaign;
        });
        return { success: true, data: campaignsWithImageData };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function addCampaign(campaign) {
    try {
        let imageDataBuffer = null;
        if (campaign.image_data) {
            const base64Data = campaign.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const stmt = db.prepare('INSERT INTO campaigns (id, name, image_data, description, author, game, participants, notes) VALUES (@id, @name, @image_data, @description, @author, @game, @participants, @notes)');
        const campaignToInsert = { ...campaign, image_data: imageDataBuffer };
        const info = stmt.run(campaignToInsert);
        return { success: true, id: campaign.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateCampaign(campaign) {
    try {
        let imageDataBuffer = null;
        if (campaign.image_data && campaign.image_data.startsWith('data:image')) {
            const base64Data = campaign.image_data.replace(/^data:image\/\w+;base64,/, "");
            imageDataBuffer = Buffer.from(base64Data, 'base64');
        }
        const stmt = db.prepare('UPDATE campaigns SET name = @name, image_data = @image_data, description = @description, author = @author, game = @game, participants = @participants, notes = @notes WHERE id = @id');
        const campaignToUpdate = { ...campaign, image_data: imageDataBuffer };
        const info = stmt.run(campaignToUpdate);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function deleteCampaign(campaignId) {
    try {
        const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
        const info = stmt.run(campaignId);
        return { success: true, changes: info.changes };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

module.exports = {
    getCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
};