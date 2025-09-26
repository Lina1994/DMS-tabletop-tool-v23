const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:3001';

const appDataPath = path.join(__dirname, 'data');
const mapsFilePath = path.join(appDataPath, 'maps.json'); // Still needed for currentMap.json logic
const currentMapFilePath = path.join(appDataPath, 'currentMap.json');
const monstersFilePath = path.join(appDataPath, 'monsters.json'); // Still needed for import/export
const shopsFilePath = path.join(appDataPath, 'shops.json'); // Still needed for import/export
const mapsImagesPath = path.join(appDataPath, 'maps_images');
const musicPath = path.join(appDataPath, 'music');
const settingsFilePath = path.join(appDataPath, 'settings.json'); // New settings file path

if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath);
}
if (!fs.existsSync(mapsImagesPath)) {
  fs.mkdirSync(mapsImagesPath);
}
if (!fs.existsSync(musicPath)) {
  fs.mkdirSync(musicPath);
}

let mainWindow;
let playerWindow;
let panoramicViewWindow;
let currentPersistedMap = null;
let songPrioritySetting = 'encounter';

// --- NEW: State for Panoramic View Character ---
let panoramicCharacter = null;

// Helper function to broadcast panoramic character changes to all windows
function broadcastPanoramicCharacterChange() {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('panoramic-character-changed', panoramicCharacter);
    }
  });
}

// Load current map on app start
try {
  if (fs.existsSync(currentMapFilePath)) {
    const mapData = fs.readFileSync(currentMapFilePath, 'utf8');
    currentPersistedMap = JSON.parse(mapData);
  }
} catch (error) {
  console.error('Error al cargar el mapa actual:', error);
}

// Load settings on app start
try {
  if (fs.existsSync(settingsFilePath)) {
    const settingsData = fs.readFileSync(settingsFilePath, 'utf8');
    const settings = JSON.parse(settingsData);
    if (settings.songPriority) {
      songPrioritySetting = settings.songPriority;
    }
  }
} catch (error) {
  console.error('Error al cargar la configuración:', error);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'public', 'Logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('close', () => {
    if (playerWindow) {
      playerWindow.close();
    }
    if (panoramicViewWindow) {
      panoramicViewWindow.close();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createPlayerWindow() {
  if (playerWindow) {
    playerWindow.focus();
    return;
  }

  playerWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, 'public', 'Logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  playerWindow.loadURL('http://localhost:3000/player-view');

  playerWindow.webContents.on('did-finish-load', () => {
    if (currentPersistedMap) {
      const mapToSend = { ...currentPersistedMap };
      if (mapToSend.image_data) {
        const extension = path.extname(mapToSend.name).slice(1);
        mapToSend.imageDataUrl = `data:image/${extension};base64,${mapToSend.image_data.toString('base64')}`;
      } else if (mapToSend.imagePath) {
        const imageName = path.basename(mapToSend.imagePath);
        mapToSend.imagePath = `file://${path.join(mapsImagesPath, imageName)}`;
      }
      playerWindow.webContents.send('update-player-map', mapToSend);
    }
  });

  playerWindow.on('closed', () => {
    playerWindow = null;
  });
}

function createPanoramicViewWindow() {
  if (panoramicViewWindow) {
    panoramicViewWindow.focus();
    return;
  }

  panoramicViewWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'public', 'Logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  panoramicViewWindow.loadURL('http://localhost:3000/panoramic-view');

  panoramicViewWindow.webContents.on('did-finish-load', () => {
    // Send current map background
    if (currentPersistedMap && currentPersistedMap.panoramic_view_data) {
        const mapToSend = { ...currentPersistedMap };
        const extension = path.extname(mapToSend.name).slice(1) || 'png';
        let base64String = '';

        if (typeof mapToSend.panoramic_view_data === 'string') {
            base64String = mapToSend.panoramic_view_data.startsWith('data:image/')
            ? mapToSend.panoramic_view_data.split(',')[1]
            : mapToSend.panoramic_view_data;
        } else if (mapToSend.panoramic_view_data.data) {
            base64String = Buffer.from(mapToSend.panoramic_view_data.data).toString('base64');
        }

        if (base64String) {
            mapToSend.panoramicDataUrl = `data:image/${extension};base64,${base64String}`;
            panoramicViewWindow.webContents.send('update-panoramic-view', mapToSend);
        }
    }
    // --- MODIFIED: Also send the current character on load ---
    broadcastPanoramicCharacterChange();
  });

  panoramicViewWindow.on('closed', () => {
    panoramicViewWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- NEW: IPC Handler for Panoramic Character State ---
ipcMain.on('update-panoramic-character', (event, character) => {
  panoramicCharacter = character;
  broadcastPanoramicCharacterChange();
});

// --- NEW: IPC Handler to clear panoramic character ---
ipcMain.on('clear-panoramic-character', () => {
  panoramicCharacter = null;
  broadcastPanoramicCharacterChange();
});


// Helper function to read image file as Buffer
const readImageFileAsBuffer = (sourcePath) => {
  return fs.readFileSync(sourcePath);
};

// Helper function to generate unique IDs for backend items
const generateBackendId = (prefix = '') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// IPC for selecting a single map image
ipcMain.handle('select-map-image', async (event) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { success: false, error: 'Main window is not available.' };
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, error: 'Selección de archivo cancelada.' };
    }

    const sourcePath = filePaths[0];
    const fileName = path.basename(sourcePath);

    return { success: true, sourcePath: sourcePath, fileName: fileName };
  } catch (error) {
    console.error('Error al seleccionar la imagen:', error);
    return { success: false, error: error.message };
  }
});

// IPC for selecting a single song file
ipcMain.handle('select-song-file', async (event) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { success: false, error: 'Main window is not available.' };
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Audio', extensions: ['mp3'] }]
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, error: 'Selección de archivo cancelada.' };
    }

    const filePath = filePaths[0];

    return { success: true, filePath: filePath };
  } catch (error) {
    console.error('Error al seleccionar el archivo de audio:', error);
    return { success: false, error: error.message };
  }
});

// IPC for copying a song file to the music directory
ipcMain.handle('copy-song-file', async (event, originalPath) => {
  try {
    const fileName = path.basename(originalPath);
    const destinationPath = path.join(musicPath, fileName);
    fs.copyFileSync(originalPath, destinationPath);
    return { success: true, newPath: destinationPath };
  } catch (error) {
    console.error('Error al copiar el archivo de audio:', error);
    return { success: false, error: error.message };
  }
});

// IPC for saving a single map
ipcMain.handle('save-map', async (event, { sourcePath, mapName, mapGroup, mapUrl }) => {
  try {
    const imageData = readImageFileAsBuffer(sourcePath);

    const newMap = {
      name: mapName,
      group: mapGroup,
      url: mapUrl,
      image_data: imageData, // Send buffer instead of path
      imagePath: null, // No longer saving a file path
    };

    return { success: true, newMap: newMap };
  } catch (error) {
    console.error('Error al guardar el mapa:', error);
    return { success: false, error: error.message };
  }
});


// IPC for selecting and saving map images from a folder
ipcMain.handle('select-and-save-map-folder', async (event) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { success: false, error: 'Main window is not available.' };
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, error: 'Selección de carpeta cancelada.' };
    }

    const folderPath = filePaths[0];
    const files = fs.readdirSync(folderPath);
    const mapsWithData = [];
		const errors = [];

    for (const file of files) {
      const sourcePath = path.join(folderPath, file);
      const stats = fs.statSync(sourcePath);

      if (stats.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
				try {
        	const imageData = readImageFileAsBuffer(sourcePath);
        	mapsWithData.push({
            name: file,
            image_data: imageData,
            fileName: file
          });
				} catch (error) {
      		errors.push({ fileName: file, error: error.message });
    		}
      }
    }
    return { success: true, mapsWithData: mapsWithData, errors: errors };
  } catch (error) {
    console.error('Error al seleccionar y guardar la carpeta de imágenes:', error);
    return { success: false, error: error.message };
  }
});

// IPC para guardar mapas (asíncrono)
ipcMain.on('save-maps', async (event, mapsFromRenderer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/maps`);
    const currentMapsInDb = await response.json();

    const mapsFromRendererMap = new Map(mapsFromRenderer.map(m => [m.id, m]));
    const currentMapsInDbMap = new Map(currentMapsInDb.map(m => [m.id, m]));

    // Add or update maps
    for (const map of mapsFromRenderer) {
      const mapToSave = { ...map, keepOpen: map.keepOpen ? 1 : 0 };
      // If image_data is a base64 string, convert it back to a buffer
      if (mapToSave.image_data && typeof mapToSave.image_data === 'string') {
        mapToSave.image_data = Buffer.from(mapToSave.image_data, 'base64');
      }
      if (mapToSave.panoramic_view_data && typeof mapToSave.panoramic_view_data === 'string') {
        mapToSave.panoramic_view_data = Buffer.from(mapToSave.panoramic_view_data, 'base64');
      }

      if (currentMapsInDbMap.has(map.id)) {
        await fetch(`${API_BASE_URL}/maps/${map.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapToSave),
        });
      } else {
        await fetch(`${API_BASE_URL}/maps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapToSave),
        });
      }
    }

    // Delete maps not present in the renderer's list
    for (const mapId of currentMapsInDbMap.keys()) {
      if (!mapsFromRendererMap.has(mapId)) {
        await fetch(`${API_BASE_URL}/maps/${mapId}`, {
          method: 'DELETE',
        });
      }
    }

  } catch (error) {
    console.error('Error al guardar mapas en la base de datos a través del backend:', error);
  }
});

// IPC para cargar mapas
ipcMain.handle('load-maps', async (event) => {
  try {
    const response = await fetch(`${API_BASE_URL}/maps`);
    const maps = await response.json();

    const resolvedMaps = maps.map(map => {
      if (map.image_data) {
        const buffer = Buffer.from(map.image_data.data);
        const extension = path.extname(map.name).slice(1) || 'png';
        map.image_data = buffer.toString('base64');
        map.imageDataUrl = `data:image/${extension};base64,${buffer.toString('base64')}`;
      }
      if (map.panoramic_view_data) {
        const extension = path.extname(map.name).slice(1) || 'png';
        let base64String = '';

        if (typeof map.panoramic_view_data === 'string') {
          base64String = map.panoramic_view_data.startsWith('data:image/')
            ? map.panoramic_view_data.split(',')[1]
            : map.panoramic_view_data;
        } else if (map.panoramic_view_data.data) {
          base64String = Buffer.from(map.panoramic_view_data.data).toString('base64');
        }

        if (base64String) {
          map.panoramic_view_data = base64String;
          map.panoramicDataUrl = `data:image/${extension};base64,${base64String}`;
        }
      }
      if (map.imagePath) {
        const imageName = path.basename(map.imagePath);
        return {
          ...map,
          imagePath: `file://${path.join(mapsImagesPath, imageName)}`
        };
      }
      return map;
    });
    return { success: true, maps: resolvedMaps };
  } catch (error) {
    console.error('Error al cargar mapas desde el backend:', error);
    return { success: false, error: error.message };
  }
});

// IPC para guardar monstruos (asíncrono)
ipcMain.on('save-monsters', async (event, monstersFromRenderer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/monsters`);
    const currentMonstersInDb = await response.json();

    const monstersFromRendererMap = new Map(monstersFromRenderer.map(m => [m.id, m]));
    const currentMonstersInDbMap = new Map(currentMonstersInDb.map(m => [m.id, m]));

    // Add or update monsters
    for (const monster of monstersFromRenderer) {
      if (currentMonstersInDbMap.has(monster.id)) {
        await fetch(`${API_BASE_URL}/monsters/${monster.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(monster),
        });
      } else {
        await fetch(`${API_BASE_URL}/monsters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(monster),
        });
      }
    }

    // Delete monsters not present in the renderer's list
    for (const monsterId of currentMonstersInDbMap.keys()) {
      if (!monstersFromRendererMap.has(monsterId)) {
        await fetch(`${API_BASE_URL}/monsters/${monsterId}`, {
          method: 'DELETE',
        });
      }
    }

  } catch (error) {
    console.error('Error al guardar monstruos en la base de datos a través del backend:', error);
  }
});

// IPC para cargar monstruos
ipcMain.handle('load-monsters', async (event) => {
  try {
    const response = await fetch(`${API_BASE_URL}/monsters`);
    const monsters = await response.json();
    return { success: true, monsters: monsters };
  } catch (error) {
    console.error('Error al cargar monstruos desde el backend:', error);
    return { success: false, error: error.message };
  }
});

// IPC para guardar tiendas (asíncrono)
ipcMain.on('save-shops', async (event, shopsFromRenderer) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shops`);
    const currentShopsInDb = await response.json();

    const shopsFromRendererMap = new Map(shopsFromRenderer.map(s => [s.id, s]));
    const currentShopsInDbMap = new Map(currentShopsInDb.map(s => [s.id, s]));

    // Sync Shops
    for (const shop of shopsFromRenderer) {
      if (currentShopsInDbMap.has(shop.id)) {
        await fetch(`${API_BASE_URL}/shops/${shop.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shop),
        });
      } else {
        await fetch(`${API_BASE_URL}/shops`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(shop),
        });
      }

      const currentCategoriesInDbMap = new Map(currentShopsInDbMap.has(shop.id) ? currentShopsInDbMap.get(shop.id).categories.map(c => [c.id, c]) : []);
      const categoriesFromRendererMap = new Map(shop.categories.map(c => [c.id, c]));

      // Sync Categories for current shop
      for (const category of shop.categories) {
        if (currentCategoriesInDbMap.has(category.id)) {
          await fetch(`${API_BASE_URL}/categories/${category.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
          });
        } else {
          await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
          });
        }

        const currentItemsInDbMap = new Map(currentCategoriesInDbMap.has(category.id) ? currentCategoriesInDbMap.get(category.id).items.map(i => [i.id, i]) : []);
        const itemsFromRendererMap = new Map(category.items.map(i => [i.id, i]));

        // Sync Items for current category
        for (const item of category.items) {
          if (currentItemsInDbMap.has(item.id)) {
            await fetch(`${API_BASE_URL}/items/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          } else {
            await fetch(`${API_BASE_URL}/items`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });
          }
        }

        // Delete items not present in renderer's list for this category
        for (const itemId of currentItemsInDbMap.keys()) {
          if (!itemsFromRendererMap.has(itemId)) {
            await fetch(`${API_BASE_URL}/items/${itemId}`, {
              method: 'DELETE',
            });
          }
        }
      }

      // Delete categories not present in renderer's list for this shop
      for (const categoryId of currentCategoriesInDbMap.keys()) {
        if (!categoriesFromRendererMap.has(categoryId)) {
          await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
          });
        }
      }
    }

    // Delete shops not present in the renderer's list
    for (const shopId of currentShopsInDbMap.keys()) {
      if (!shopsFromRendererMap.has(shopId)) {
        await fetch(`${API_BASE_URL}/shops/${shopId}`, {
          method: 'DELETE',
        });
      }
    }

  } catch (error) {
    console.error('Error al guardar tiendas en la base de datos a través del backend:', error);
  }
});

// IPC para cargar tiendas
ipcMain.handle('load-shops', async (event) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shops`);
    const shops = await response.json();
    return { success: true, shops: shops };
  } catch (error) {
    console.error('Error al cargar tiendas desde el backend:', error);
    return { success: false, error: error.message };
  }
});

// IPC para guardar el mapa actual
ipcMain.on('set-current-preview-map', (event, mapData) => {
  // Clear panoramic character only if the map actually changes
  if (!currentPersistedMap || currentPersistedMap.id !== mapData.id) {
    panoramicCharacter = null; // Clear the character in main process
    broadcastPanoramicCharacterChange(); // Notify all windows
    if (panoramicViewWindow) {
      panoramicViewWindow.webContents.send('clear-panoramic-character');
    }
  }

  if (mapData.panoramic_view_data && typeof mapData.panoramic_view_data === 'string' && mapData.panoramic_view_data.startsWith('data:image/')) {
    const parts = mapData.panoramic_view_data.split(',');
    if (parts.length > 1) {
      mapData.panoramic_view_data = parts[1];
    }
  }
  currentPersistedMap = mapData;
  try {
    fs.writeFileSync(currentMapFilePath, JSON.stringify(mapData, null, 2));
} catch (error) {
  console.error('Error al guardar el mapa actual:', error);
}
});

// IPC para obtener el mapa actual
ipcMain.on('get-current-preview-map', (event) => {
  event.returnValue = currentPersistedMap;
});

// IPC para obtener la ruta de las imágenes de los mapas
ipcMain.on('get-maps-images-path', (event) => {
  event.returnValue = mapsImagesPath;
});

ipcMain.handle('delete-map-image', (event, fileName) => {
  try {
    if (!fileName) {
      return { success: true };
    }
    const imagePath = path.join(mapsImagesPath, fileName);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    } else {
      console.log(`Se intentó eliminar una imagen que no existe: ${fileName}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Error al eliminar la imagen ${fileName}:`, error);
    return { success: false, error: error.message };
  }
});

// IPC para abrir la ventana de los jugadores
ipcMain.on('open-player-window', () => {
  createPlayerWindow();
});

// IPC para mostrar el mapa en la ventana de los jugadores
ipcMain.on('display-map-player-window', (event, mapData) => {
  const oldMapId = currentPersistedMap ? currentPersistedMap.id : null;
  currentPersistedMap = mapData; // Update currentPersistedMap immediately

  // Clear panoramic character only if the map actually changes
  if (!oldMapId || oldMapId !== mapData.id) {
    panoramicCharacter = null; // Clear the character in main process
    broadcastPanoramicCharacterChange(); // Notify all windows
    if (panoramicViewWindow) {
      panoramicViewWindow.webContents.send('clear-panoramic-character');
    }
  }

  const mapToSend = { ...mapData };
  if (mapToSend.image_data) {
    const extension = path.extname(mapToSend.name).slice(1) || 'png';
    mapToSend.imageDataUrl = `data:image/${extension};base64,${mapToSend.image_data.toString('base64')}`;
  }
  if (playerWindow) {
    playerWindow.webContents.send('update-player-map', {
      ...mapToSend,
      showGrid: mapData.showGrid,
      gridSize: mapData.gridSize,
      combatTokens: mapData.combatTokens,
      currentCombatantId: mapData.currentCombatantId,
      manuallySelectedCombatantId: mapData.manuallySelectedCombatantId
    });
  }

  if (panoramicViewWindow) {
    if (mapToSend.panoramic_view_data) {
      const extension = path.extname(mapToSend.name).slice(1) || 'png';
      let base64String;

      if (typeof mapToSend.panoramic_view_data === 'string') {
        base64String = mapToSend.panoramic_view_data.startsWith('data:image/')
          ? mapToSend.panoramic_view_data.split(',')[1]
          : mapToSend.panoramic_view_data;
      } else if (mapToSend.panoramic_view_data.data) {
        base64String = Buffer.from(mapToSend.panoramic_view_data.data).toString('base64');
      } else {
        base64String = '';
      }

      if (base64String) {
        mapToSend.panoramicDataUrl = `data:image/${extension};base64,${base64String}`;
        panoramicViewWindow.webContents.send('update-panoramic-view', mapToSend);
      } else {
        // Si no hay datos panorámicos, enviar señal para fondo gris
        panoramicViewWindow.webContents.send('set-panoramic-background-color', '#F0F0F0'); // Gris claro
      }
    } else {
      // Si el mapa no tiene panoramic_view_data, enviar señal para fondo gris
      panoramicViewWindow.webContents.send('set-panoramic-background-color', '#F0F0F0'); // Gris claro
    }
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-master-preview', mapToSend);
  }
});

// IPC to update tokens in player window
ipcMain.on('tokens-updated', (event, tokens) => {
  if (playerWindow && !playerWindow.isDestroyed()) {
    playerWindow.webContents.send('tokens-updated', tokens);
  }
});

// IPC para que la ventana del jugador notifique a la ventana principal sobre el mapa actual
ipcMain.on('player-window-map-changed', (event, mapData) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-master-preview', mapData);
  }
});

// IPC for player window resize
ipcMain.on('player-window-resize', (event, dimensions) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('player-window-dimensions', dimensions);
  }
});

// IPC para abrir la ventana de vista panorámica
ipcMain.on('open-panoramic-view-window', (event, mapData) => {
  if (mapData) {
    currentPersistedMap = mapData;
  }
  createPanoramicViewWindow();
});

// IPC para que la ventana de vista panorámica solicite datos
ipcMain.on('request-panoramic-data', (event) => {
  if (panoramicViewWindow) { // Check if window exists
    if (currentPersistedMap && currentPersistedMap.panoramic_view_data) {
      const mapToSend = { ...currentPersistedMap };
      const extension = path.extname(mapToSend.name).slice(1) || 'png';
      let base64String = '';

      if (typeof mapToSend.panoramic_view_data === 'string') {
        base64String = mapToSend.panoramic_view_data.startsWith('data:image/')
          ? mapToSend.panoramic_view_data.split(',')[1]
          : mapToSend.panoramic_view_data;
      } else if (mapToSend.panoramic_view_data.data) {
        base64String = Buffer.from(mapToSend.panoramic_view_data.data).toString('base64');
      }

      if (base64String) {
        mapToSend.panoramicDataUrl = `data:image/${extension};base64,${base64String}`;
        panoramicViewWindow.webContents.send('update-panoramic-view', mapToSend);
      }
    }
    // Also send the current panoramic character when data is requested
    panoramicViewWindow.webContents.send('panoramic-character-changed', panoramicCharacter);
  }
});

// --- NEW: IPC Handler to request current panoramic character ---
ipcMain.on('request-panoramic-character', (event) => {
  // Send the current panoramic character to the requesting window
  event.sender.send('panoramic-character-changed', panoramicCharacter);
});

// --- REMOVED old handler ---
// ipcMain.on('set-panoramic-overlay', (event, imageUrl) => {
//   if (panoramicViewWindow && !panoramicViewWindow.isDestroyed()) {
//     panoramicViewWindow.webContents.send('update-panoramic-overlay', imageUrl);
//   }
// });

// New IPC handler for importing monsters from Excel
ipcMain.on('import-monsters-from-excel', async (event) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    event.reply('imported-monsters', { success: false, error: 'Main window is not available.' });
    return;
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Archivos de Excel', extensions: ['xlsx', 'xls'] }
      ]
    });

    if (canceled || filePaths.length === 0) {
      event.reply('imported-monsters', { success: false, error: 'Selección de archivo cancelada.' });
      return;
    }

    const filePath = filePaths[0];
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonMonsters = xlsx.utils.sheet_to_json(worksheet);

    const importedMonsters = jsonMonsters.map(row => {
      return {
        name: row['Nombre'] || '',
        vd: String(row['VD'] || ''),
        type: row['Tipo'] || '',
        alignment: row['Alineamiento'] || '',
        origin: row['Origen'] || '',
        size: String(row['Tamaño'] || ''),
        px: String(row['PX'] || ''),
        armor: row['Armadura'] || '',
        hp: row['Puntos de golpe'] || '',
        speed: row['Velocidad'] || '',
        str: String(row['FUE'] || ''),
        dex: String(row['DES'] || ''),
        con: String(row['CONS'] || ''),
        int: String(row['INT'] || ''),
        wis: String(row['SAB'] || ''),
        cha: String(row['CAR'] || ''),
      savingThrows: row['Tiradas de salvación'] || '',
      skills: row['Habilidades'] || '',
      senses: row['Sentidos'] || '',
      languages: row['Idiomas'] || '',
      damageResistances: row['Resistencias al daño'] || '',
      damageImmunities: row['Inmunidades al daño'] || '',
      conditionImmunities: row['Inmunidades al estado'] || '',
      damageVulnerabilities: row['Vulnerabilidades al daño'] || '',
      traits: row['Rasgos'] || '',
      actions: row['Acciones'] || '',
      legendaryActions: row['Acciones legendarias'] || '',
      reactions: row['Reacciones'] || '',
      description: row['Descripción'] || '',
      image: row['Imágen'] || ''
      };
    });

    event.reply('imported-monsters', { success: true, monsters: importedMonsters });

  } catch (error) {
    console.error('Error al importar monstruos desde Excel:', error);
    event.reply('imported-monsters', { success: false, error: error.message });
  }
});

// New IPC handler for exporting monsters to Excel
ipcMain.on('export-monsters-to-excel', async (event, monstersToExport) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    event.reply('export-monsters-result', { success: false, error: 'Main window is not available.' });
    return;
  }
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Guardar Monstruos como Excel',
      defaultPath: 'monstruos.xlsx',
      filters: [
        { name: 'Archivos de Excel', extensions: ['xlsx', 'xls'] }
      ]
    });

    if (canceled || !filePath) {
      event.reply('export-monsters-result', { success: false, error: 'Guardado de archivo cancelado.' });
      return;
    }

    const headers = Object.keys(monstersToExport[0] || {});
    const dataForExcel = monstersToExport.map(monster => headers.map(header => monster[header]));

    const ws = xlsx.utils.aoa_to_sheet([headers, ...dataForExcel]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Monstruos');

    xlsx.writeFile(wb, filePath);

    event.reply('export-monsters-result', { success: true });

  } catch (error) {
    console.error('Error al exportar monstruos a Excel:', error);
    event.reply('export-monters-result', { success: false, error: error.message });
  }
});

ipcMain.on('import-items-from-excel', async (event, { categoryType }) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    event.reply('imported-items', { success: false, error: 'Main window is not available.' });
    return;
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Archivos de Excel', extensions: ['xlsx', 'xls'] }
      ]
    });

    if (canceled || filePaths.length === 0) {
      event.reply('imported-items', { success: false, error: 'Selección de archivo cancelada.' });
      return;
    }

    const filePath = filePaths[0];
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonItems = xlsx.utils.sheet_to_json(worksheet);
    const categoryResponse = await fetch(`${API_BASE_URL}/categories/${categoryType}`);
    if (!categoryResponse.ok) {
      const errorText = await categoryResponse.text();
      console.error(`[main.js] Error al obtener detalles de la categoría: ${categoryResponse.statusText}. Cuerpo de la respuesta: ${errorText}`);
      throw new Error(`Failed to fetch category details: ${categoryResponse.statusText}. ${errorText}`);
    }
    const categoryDetails = await categoryResponse.json();
    const columns = categoryDetails.columns_definition ? JSON.parse(categoryDetails.columns_definition) : [];
    const columnNames = columns.map(col => col.name);

    const itemsToSave = jsonItems.map(row => {
      const itemData = {};
      columnNames.forEach(colName => {
        itemData[colName] = row[colName] !== undefined ? row[colName] : '';
      });
      return {
        id: generateBackendId('item'),
        category_id: categoryType,
        data: JSON.stringify(itemData)
      };
    });

    for (const item of itemsToSave) {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[main.js] Error al guardar item ${item.id}: ${response.statusText}. Cuerpo de la respuesta: ${errorText}`);
        throw new Error(`Failed to save item ${item.id}: ${response.statusText}. ${errorText}`);
      }
    }

    event.reply('imported-items', { success: true, categoryType });

  } catch (error) {
    console.error(`[main.js] Error general en la importación de items desde Excel: ${error.message}`);
    event.reply('imported-items', { success: false, error: error.message });
  }
});

ipcMain.on('export-items-to-excel', async (event, { items, categoryName }) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    event.reply('export-items-result', { success: false, error: 'Main window is not available.' });
    return;
  }
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: `Guardar ${categoryName} como Excel`,
      defaultPath: `${categoryName}.xlsx`,
      filters: [
        { name: 'Archivos de Excel', extensions: ['xlsx', 'xls'] }
      ]
    });

    if (canceled || !filePath) {
      event.reply('export-items-result', { success: false, error: 'Guardado de archivo cancelado.' });
      return;
    }

    const headers = Object.keys(items[0] || {});
    const dataForExcel = items.map(item => headers.map(header => item[header]));

    const ws = xlsx.utils.aoa_to_sheet([headers, ...dataForExcel]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, categoryName);

    xlsx.writeFile(wb, filePath);

    event.reply('export-items-result', { success: true });

  } catch (error) {
    console.error(`Error al exportar items a Excel: ${error}`);
    event.reply('export-items-result', { success: false, error: error.message });
  }
});

// --- Song IPC Handlers ---

ipcMain.handle('load-songs', async (event) => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const songs = await response.json();
    return { success: true, songs: songs };
  } catch (error) {
    console.error('Error al cargar canciones desde el backend:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-song', async (event, songData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error al añadir canción a través del backend:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('edit-song', async (event, songData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs/${songData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(songData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error al editar canción a través del backend:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-song', async (event, songId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error al eliminar canción a través del backend:', error);
    return { success: false, error: error.message };
  }
});

// IPC for setting song priority
ipcMain.handle('set-song-priority', async (event, priority) => {
  try {
    songPrioritySetting = priority;
    fs.writeFileSync(settingsFilePath, JSON.stringify({ songPriority: songPrioritySetting }, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Error al guardar la prioridad de canción:', error);
    return { success: false, error: error.message };
  }
});

// IPC for getting song priority
ipcMain.handle('get-song-priority', async (event) => {
  return { success: true, priority: songPrioritySetting };
});

// IPC for Worldpedia image selection
ipcMain.on('worldpedia:open-image-dialog', async (event) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Seleccionar Imagen para la Enciclopedia',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
    });

    if (canceled || filePaths.length === 0) {
      return;
    }

    const sourcePath = filePaths[0];
    const fileData = fs.readFileSync(sourcePath, 'base64');
    const mimeType = `image/${path.extname(sourcePath).slice(1)}`;
    
    event.sender.send('worldpedia:image-selected', {
      success: true,
      fileData: `data:${mimeType};base64,${fileData}`
    });

  } catch (error) {
    console.error('Error al seleccionar imagen para la enciclopedia:', error);
    event.sender.send('worldpedia:image-selected', {
      success: false,
      error: error.message
    });
  }
});