from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 15)

CAMPAIGN_NAME = "Prueba automatizada"

try:
    # Paso 1: Ir a la vista de campañas
    driver.get("http://localhost:3000/campaign")
    print("1. Página de campañas cargada.")

    # Paso 2: Buscar la tarjeta de la campaña por su nombre
    # Usamos contains(@class, 'campaign-card') para manejar espacios en la clase
    campaign_card = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, f"//h2[text()='{CAMPAIGN_NAME}']/ancestor::div[contains(@class, 'campaign-card')]")
        )
    )
    print(f"2. Campaña '{CAMPAIGN_NAME}' encontrada.")

    # Paso 3: Clic en el botón "Delete" (usamos contains para tolerar espacios o estructura interna)
    delete_button = campaign_card.find_element(By.XPATH, ".//button[contains(text(), 'Delete')]")
    delete_button.click()
    print("3. Clic en 'Delete'.")

    # Paso 4: Tres confirmaciones consecutivas
    for i in range(3):
        confirm_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Confirmar']"))
        )
        confirm_button.click()
        print(f"4.{i+1}. Confirmación {i+1} aceptada.")

    # Paso 5: Verificar que la campaña ya NO está en la lista
    # Solo buscamos que el <h2> con el nombre desaparezca (más simple y robusto)
    wait.until_not(
        EC.presence_of_element_located((By.XPATH, f"//h2[text()='{CAMPAIGN_NAME}']"))
    )
    print("5. Campaña eliminada con éxito.")

    print("✅ Prueba pasada: Campaña eliminada correctamente.")

except TimeoutException:
    print("❌ Prueba fallida: Tiempo de espera agotado.")
    print("   - ¿Existe la campaña 'Prueba automatizada'?")
    print("   - ¿La URL es exactamente '/campaign'?")
    print("   - ¿El botón dice exactamente 'Delete' (sin íconos ni espacios extra)?")
except Exception as e:
    print(f"❌ Prueba fallida: {str(e)}")
finally:
    driver.quit()