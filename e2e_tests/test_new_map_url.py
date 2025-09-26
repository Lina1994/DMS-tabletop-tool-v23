from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 15)

CAMPAIGN_NAME = "Prueba automatizada"
MAP_NAME = "Mapa de Prueba E2E"
GROUP = "Grupo de Prueba"
MAP_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Philips_PM5544.svg/1152px-Philips_PM5544.svg.png?20140416150639"
PANORAMIC_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Philips_PM5544.svg/1152px-Philips_PM5544.svg.png?20140416150639"

try:
    # 1. Ir a la home
    driver.get("http://localhost:3000")
    print("1. Página principal cargada.")

    # 2. Seleccionar la campaña
    campaign_selector = wait.until(
        EC.element_to_be_clickable((By.XPATH, f"//li[@class='campaign-list-item' and text()='{CAMPAIGN_NAME}']"))
    )
    campaign_selector.click()
    print(f"2. Seleccionada campaña: {CAMPAIGN_NAME}.")

    # 3. Navegar a /maps
    maps_link = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[@href='/maps']"))
    )
    maps_link.click()
    print("3. Navegando a /maps desde el sidebar.")

    # 4. Clic en el botón "+"
    add_map_button = wait.until(
        EC.element_to_be_clickable((By.CLASS_NAME, "add-map-btn"))
    )
    add_map_button.click()
    print("4. Clic en botón '+' para añadir mapa.")

    # 5. Rellenar el formulario
    wait.until(EC.presence_of_element_located((By.ID, "mapName")))
    driver.find_element(By.ID, "mapName").send_keys(MAP_NAME)
    driver.find_element(By.ID, "mapGroup").send_keys(GROUP)
    driver.find_element(By.ID, "mapUrl").send_keys(MAP_URL)
    driver.find_element(By.ID, "panoramicViewUrl").send_keys(PANORAMIC_URL)
    print("5. Formulario rellenado.")

    # 6. Clic en "Añadir Mapa" (con pausa y clic forzado)
    # Esperamos a que el botón sea clickeable
    add_button = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' and text()='Añadir Mapa']"))
    )
    
    # Pausa breve para permitir que el estado de React se actualice
    time.sleep(0.5)
    
    # Usar JavaScript para el clic, es más robusto contra overlays
    driver.execute_script("arguments[0].click();", add_button)
    print("6. Clic en 'Añadir Mapa'.")

    # 7. VERIFICACIÓN: Esperar a que el nuevo mapa aparezca en la lista
    new_map_card = wait.until(
        EC.presence_of_element_located((By.XPATH, f"//h3[text()='{MAP_NAME}']"))
    )
    print(f"7. Verificación: El mapa '{MAP_NAME}' se ha añadido correctamente.")

    print("✅ Prueba pasada.")

except TimeoutException:
    print("❌ Prueba fallida: Tiempo de espera agotado.")
    # Guarda una captura de pantalla para facilitar la depuración
    driver.save_screenshot('error_screenshot.png')
    print("   - Se ha guardado una captura de pantalla como 'error_screenshot.png'.")
except Exception as e:
    print(f"❌ Prueba fallida: {str(e)}")
finally:
    time.sleep(2)
    driver.quit()